// Uiseong USB static server. Standard library only; no runtime download or installation.
package main

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"io/fs"
	"net"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"
	"time"
)

const appID = "uiseong-life-usb-v1"

type health struct {
	App     string `json:"app"`
	Content string `json:"content"`
}

func main() {
	if err := run(); err != nil {
		fmt.Fprintln(os.Stderr, "ERROR:", err)
		os.Exit(1)
	}
}
func run() error {
	exe, err := os.Executable()
	if err != nil {
		return err
	}
	rootFlag := flag.String("root", filepath.Join(filepath.Dir(exe), "..", "dist"), "Static content directory")
	port := flag.Int("port", 18765, "Preferred local port; 0 selects a free port")
	noBrowser := flag.Bool("no-browser", false, "Do not open the browser")
	flag.Parse()
	if *port < 0 || *port > 65535 {
		return fmt.Errorf("invalid port")
	}
	root, err := filepath.Abs(*rootFlag)
	if err != nil {
		return err
	}
	// os.Root keeps requests inside dist even if paths or symlinks attempt to escape it.
	contentRoot, err := os.OpenRoot(root)
	if err != nil {
		return fmt.Errorf("dist folder not found: %w", err)
	}
	defer contentRoot.Close()
	hash := sha256.New()
	for _, name := range []string{"index.html", "data/records.csv"} {
		f, e := contentRoot.Open(name)
		if e != nil {
			return fmt.Errorf("required file %s: %w", name, e)
		}
		_, e = io.Copy(hash, f)
		f.Close()
		if e != nil {
			return e
		}
		hash.Write([]byte{0})
	}
	expected := health{App: appID, Content: hex.EncodeToString(hash.Sum(nil))}
	var listener net.Listener
	client := &http.Client{Timeout: 500 * time.Millisecond, Transport: &http.Transport{Proxy: nil}, CheckRedirect: func(r *http.Request, via []*http.Request) error { return http.ErrUseLastResponse }}
	defer client.CloseIdleConnections()
	for attempt := 0; attempt < 30; attempt++ {
		candidate := *port + attempt
		if *port == 0 {
			candidate = 0
		}
		if candidate > 65535 {
			break
		}
		address := net.JoinHostPort("127.0.0.1", strconv.Itoa(candidate))
		listener, err = net.Listen("tcp4", address)
		if err == nil {
			break
		}
		// Repeated double-click reopens an identical running build instead of starting duplicates.
		response, e := client.Get("http://" + address + "/__uiseong_health")
		if e == nil {
			var existing health
			decodeErr := json.NewDecoder(io.LimitReader(response.Body, 4096)).Decode(&existing)
			response.Body.Close()
			if decodeErr == nil && response.StatusCode == 200 && existing == expected {
				fmt.Println("Existing service:", "http://"+address+"/")
				openBrowser("http://"+address+"/", *noBrowser)
				return nil
			}
		}
	}
	if listener == nil {
		return fmt.Errorf("no available local port: %w", err)
	}
	defer listener.Close()
	address := listener.Addr().String()
	url := "http://" + address + "/"
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Host != address {
			http.Error(w, "Invalid host", http.StatusForbidden)
			return
		}
		if r.Method != http.MethodGet && r.Method != http.MethodHead {
			w.Header().Set("Allow", "GET, HEAD")
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("Cache-Control", "no-store")
		w.Header().Set("Referrer-Policy", "no-referrer")
		if r.URL.Path == "/__uiseong_health" {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(expected)
			return
		}
		relative := strings.TrimPrefix(r.URL.Path, "/")
		if relative == "" {
			relative = "index.html"
		}
		if !fs.ValidPath(relative) || strings.Contains(relative, "\\") {
			http.NotFound(w, r)
			return
		}
		for _, part := range strings.Split(relative, "/") {
			if strings.HasPrefix(part, ".") {
				http.NotFound(w, r)
				return
			}
		}
		f, e := contentRoot.Open(relative)
		if e != nil {
			http.NotFound(w, r)
			return
		}
		defer f.Close()
		info, e := f.Stat()
		if e != nil || !info.Mode().IsRegular() {
			http.NotFound(w, r)
			return
		}
		// Only static dist files are available. No source, executable or environment files.
		http.ServeContent(w, r, info.Name(), info.ModTime(), f)
	})
	server := &http.Server{Handler: handler, ReadHeaderTimeout: 5 * time.Second, IdleTimeout: 30 * time.Second}
	done := make(chan error, 1)
	go func() { done <- server.Serve(listener) }()
	ready := false
	for attempt := 0; attempt < 30; attempt++ {
		response, e := client.Get(url + "__uiseong_health")
		if e == nil {
			response.Body.Close()
			if response.StatusCode == 200 {
				ready = true
				break
			}
		}
		time.Sleep(100 * time.Millisecond)
	}
	if !ready {
		return fmt.Errorf("local readiness check failed")
	}
	fmt.Println("READY", url)
	fmt.Println("Keep this window open. To stop: Ctrl+C or close this window.")
	openBrowser(url, *noBrowser)
	interrupts := make(chan os.Signal, 1)
	signal.Notify(interrupts, os.Interrupt)
	defer signal.Stop(interrupts)
	select {
	case <-interrupts:
		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()
		return server.Shutdown(ctx)
	case err := <-done:
		if err == http.ErrServerClosed {
			return nil
		}
		return err
	}
}
func openBrowser(url string, disabled bool) {
	if disabled {
		return
	}
	if runtime.GOOS != "windows" {
		fmt.Println("Open this address in a browser:", url)
		return
	}
	// Fixed system launcher; URL is generated from the bound numeric loopback address.
	if err := exec.Command("rundll32.exe", "url.dll,FileProtocolHandler", url).Start(); err != nil {
		fmt.Println("Browser could not be opened. Open this address manually:", url)
	}
}
