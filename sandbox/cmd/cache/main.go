package main

import (
	cachePack "admin/panel/sandbox/internal/cache"
	"bufio"
	"fmt"
	"os"
	"strings"
)

func main() {
	var cache cachePack.Cache
	reader := bufio.NewReader(os.Stdin)

	fmt.Println("LRU Cache Management Console")
	fmt.Println("----------------------------")
	fmt.Println("Available commands:")
	fmt.Println("init <capacity> - Initialize cache with given capacity")
	fmt.Println("set <key> <value> - Set key-value pair")
	fmt.Println("get <key> - Get value by key")
	fmt.Println("clear - Clear the cache")
	fmt.Println("stats - Show cache statistics")
	fmt.Println("exit - Exit the program")
	fmt.Println("----------------------------")

	for {
		fmt.Print("> ")
		input, _ := reader.ReadString('\n')
		input = strings.TrimSpace(input)
		parts := strings.Fields(input)

		if len(parts) == 0 {
			continue
		}

		command := parts[0]
		args := parts[1:]

		switch command {
		case "init":
			if len(args) != 1 {
				fmt.Println("Usage: init <capacity>")
				continue
			}
			var capacity int
			_, err := fmt.Sscanf(args[0], "%d", &capacity)
			if err != nil || capacity <= 0 {
				fmt.Println("Capacity must be a positive integer")
				continue
			}
			cache = cachePack.NewCache(capacity)
			fmt.Printf("Initialized cache with capacity %d\n", capacity)

		case "set":
			if cache == nil {
				fmt.Println("Cache not initialized. Use 'init <capacity>' first.")
				continue
			}
			if len(args) < 2 {
				fmt.Println("Usage: set <key> <value>")
				continue
			}
			key := cachePack.Key(args[0])
			value := strings.Join(args[1:], " ")
			existed := cache.Set(key, value)
			fmt.Printf("Set %s = %s (existed: %t)\n", key, value, existed)

		case "get":
			if cache == nil {
				fmt.Println("Cache not initialized. Use 'init <capacity>' first.")
				continue
			}
			if len(args) != 1 {
				fmt.Println("Usage: get <key>")
				continue
			}
			key := cachePack.Key(args[0])
			value, ok := cache.Get(key)
			if ok {
				fmt.Printf("Got %s = %v\n", key, value)
			} else {
				fmt.Printf("Key %s not found\n", key)
			}

		case "clear":
			if cache == nil {
				fmt.Println("Cache not initialized. Use 'init <capacity>' first.")
				continue
			}
			cache.Clear()
			fmt.Println("Cache cleared")

		case "stats":
			if cache == nil {
				fmt.Println("Cache not initialized. Use 'init <capacity>' first.")
				continue
			}
			// Более безопасный способ получения статистики без доступа к неэкспортированным полям
			// В реальном приложении вам нужно добавить соответствующие методы в интерфейс Cache
			fmt.Println("Cache statistics:")
			fmt.Println("(Detailed statistics require additional methods in Cache interface)")

		case "exit":
			fmt.Println("Exiting...")
			return

		default:
			fmt.Println("Unknown command. Available commands: init, set, get, clear, stats, exit")
		}
	}
}
