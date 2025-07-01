package main

import (
	"admin/panel/internal/cache"
	"bufio"
	"fmt"
	"os"
	"strconv"
	"strings"
)

func main() {
	reader := bufio.NewReader(os.Stdin)

	fmt.Print("Введите размер кэша: ")
	input, _ := reader.ReadString('\n')
	capacity, _ := strconv.Atoi(strings.TrimSpace(input))
	lru := cache.NewCache(capacity) // создаём кэш

	for {
		fmt.Println("\nМеню:")
		fmt.Println("1. Добавить элемент в кэш")
		fmt.Println("2. Получить элемент из кэша")
		fmt.Println("3. Очистить кэш")
		fmt.Println("4. Показать все элементы в кэше")
		fmt.Println("5. Выйти")
		fmt.Print("Выберите действие: ")

		cmd, _ := reader.ReadString('\n')
		cmd = strings.TrimSpace(cmd)

		switch cmd {
		case "1":
			fmt.Print("Введите ключ: ")
			k, _ := reader.ReadString('\n')
			key := cache.Key(strings.TrimSpace(k))

			fmt.Print("Введите значение: ")
			v, _ := reader.ReadString('\n')
			value := strings.TrimSpace(v)

			updated := lru.Set(key, value)
			if updated {
				fmt.Println("Элемент обновлен.")
			} else {
				fmt.Println("Элемент добавлен.")
			}

		case "2":
			fmt.Print("Введите ключ: ")
			k, _ := reader.ReadString('\n')
			key := cache.Key(strings.TrimSpace(k))

			if val, ok := lru.Get(key); ok {
				fmt.Println("Значение:", val)
			} else {
				fmt.Println("Элемент не найден.")
			}

		case "3":
			lru.Clear()
			fmt.Println("Кэш очищен.")

		case "4":
			fmt.Println("Элементы в кэше (от новых к старым):")
			for item := lru.List().Front(); item != nil; item = item.Next {
				elem := item.Value.(*cache.CacheItem)
				fmt.Printf("Ключ: %s, Значение: %v\n", elem.Key, elem.Value)
			}

		case "5":
			fmt.Println("Выход.")
			return

		default:
			fmt.Println("Неверная команда.")
		}
	}
}
