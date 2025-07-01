package cache

// ListItem — элемент двусвязного списка
type ListItem struct {
	Value interface{}
	Next  *ListItem
	Prev  *ListItem
}

// List — двусвязный список
type List struct {
	front *ListItem
	back  *ListItem
	len   int
}

// Len возвращает длину списка
func (l *List) Len() int {
	return l.len
}

// Front возвращает первый элемент списка
func (l *List) Front() *ListItem {
	return l.front
}

// Back возвращает последний элемент списка
func (l *List) Back() *ListItem {
	return l.back
}

// PushFront добавляет значение в начало списка
func (l *List) PushFront(v interface{}) *ListItem {
	item := &ListItem{Value: v}
	if l.len == 0 {
		l.front = item
		l.back = item
	} else {
		item.Next = l.front
		l.front.Prev = item
		l.front = item
	}
	l.len++
	return item
}

// PushBack добавляет значение в конец списка
func (l *List) PushBack(v interface{}) *ListItem {
	item := &ListItem{Value: v}
	if l.len == 0 {
		l.front = item
		l.back = item
	} else {
		item.Prev = l.back
		l.back.Next = item
		l.back = item
	}
	l.len++
	return item
}

// Remove удаляет элемент из списка
func (l *List) Remove(i *ListItem) {
	if i.Prev != nil {
		i.Prev.Next = i.Next
	} else {
		l.front = i.Next
	}
	if i.Next != nil {
		i.Next.Prev = i.Prev
	} else {
		l.back = i.Prev
	}
	i.Next = nil
	i.Prev = nil
	l.len--
}

// MoveToFront перемещает элемент в начало списка
func (l *List) MoveToFront(i *ListItem) {
	if i == l.front {
		return
	}
	l.Remove(i)
	i.Next = l.front
	i.Prev = nil
	if l.front != nil {
		l.front.Prev = i
	}
	l.front = i
	if l.back == nil {
		l.back = i
	}
	l.len++
}
