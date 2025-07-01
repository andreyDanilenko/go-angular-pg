package cache

type Key string

type CacheItem struct {
	Key   Key
	Value interface{}
}

type LRUCache struct {
	capacity int
	items    map[Key]*ListItem
	queue    *List
}

func NewCache(capacity int) *LRUCache {
	return &LRUCache{
		capacity: capacity,
		items:    make(map[Key]*ListItem),
		queue:    &List{},
	}
}

func (c *LRUCache) Set(key Key, value interface{}) bool {
	if item, ok := c.items[key]; ok {
		item.Value.(*CacheItem).Value = value
		c.queue.MoveToFront(item)
		return true
	}

	newItem := &CacheItem{Key: key, Value: value}
	listItem := c.queue.PushFront(newItem)
	c.items[key] = listItem

	if c.queue.Len() > c.capacity {
		tail := c.queue.Back()
		if tail != nil {
			c.queue.Remove(tail)
			delete(c.items, tail.Value.(*CacheItem).Key)
		}
	}
	return false
}

func (c *LRUCache) Get(key Key) (interface{}, bool) {
	if item, ok := c.items[key]; ok {
		c.queue.MoveToFront(item)
		return item.Value.(*CacheItem).Value, true
	}
	return nil, false
}

func (c *LRUCache) Clear() {
	c.items = make(map[Key]*ListItem)
	c.queue = &List{}
}

// Доступ к списку для отображения всех элементов
func (c *LRUCache) List() *List {
	return c.queue
}
