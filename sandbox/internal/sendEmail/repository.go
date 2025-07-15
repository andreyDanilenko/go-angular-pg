package sendEmail

import (
	"admin/panel/sandbox/internal/sendEmail/dto" // Импорт DTO (Data Transfer Object) для работы с записями верификации
	"encoding/json"                              // Для работы с JSON (сериализация/десериализация)
	"os"                                         // Для работы с файловой системой
	"sync"                                       // Для синхронизации доступа (потокобезопасность)
)

// Repository - структура, реализующая шаблон репозитория для управления записями верификации
type Repository struct {
	records      []dto.VerificationRecord // Слайс для хранения всех записей верификации
	recordsMutex sync.Mutex               // Мьютекс для обеспечения потокобезопасности при работе с records
	storageFile  string                   // Путь к файлу, где хранятся данные (персистентное хранилище)
}

// NewRepository - конструктор для создания нового экземпляра Repository
// Принимает:
// - storageFile: путь к файлу, где будут храниться данные
// Возвращает:
// - Указатель на созданный Repository
func NewRepository(storageFile string) *Repository {
	// Создаем новый экземпляр Repository
	repo := &Repository{
		storageFile: storageFile, // Инициализируем путь к файлу хранилища
	}
	// Загружаем существующие записи из файла при инициализации
	repo.loadRecords()
	return repo
}

// SaveRecord сохраняет новую запись верификации в репозитории
// Принимает:
// - record: запись верификации для сохранения
func (r *Repository) SaveRecord(record dto.VerificationRecord) {
	// Блокируем мьютекс для обеспечения потокобезопасности
	r.recordsMutex.Lock()
	// Откладываем разблокировку мьютекса до выхода из функции
	defer r.recordsMutex.Unlock()

	// Добавляем новую запись в слайс records
	r.records = append(r.records, record)
	// Сохраняем обновленные записи в файл
	r.saveRecords()
}

// FindAndRemoveRecord ищет запись по хешу и удаляет ее, если находит
// Принимает:
// - hash: хеш записи для поиска
// Возвращает:
// - bool: true если запись найдена и удалена, false если не найдена
func (r *Repository) FindAndRemoveRecord(hash string) bool {
	// Блокируем мьютекс для обеспечения потокобезопасности
	r.recordsMutex.Lock()
	// Откладываем разблокировку мьютекса до выхода из функции
	defer r.recordsMutex.Unlock()

	// Итерируем по всем записям в слайсе
	for i, record := range r.records {
		// Если нашли запись с совпадающим хешем
		if record.Hash == hash {
			// Удаляем запись из слайса (объединяем часть до и после i-го элемента)
			r.records = append(r.records[:i], r.records[i+1:]...)
			// Сохраняем обновленные записи в файл
			r.saveRecords()
			// Возвращаем true - запись найдена и удалена
			return true
		}
	}
	// Если не нашли - возвращаем false
	return false
}

// loadRecords загружает записи верификации из файла хранилища
func (r *Repository) loadRecords() {
	// Читаем весь файл в память
	file, err := os.ReadFile(r.storageFile)
	if err != nil {
		// Если файл не существует - инициализируем пустой слайс
		if os.IsNotExist(err) {
			r.records = []dto.VerificationRecord{}
			return
		}
		// При других ошибках чтения файла - паника (критическая ошибка)
		panic(err)
	}

	// Десериализуем JSON из файла в слайс records
	err = json.Unmarshal(file, &r.records)
	if err != nil {
		// При ошибках парсинга JSON - паника (критическая ошибка)
		panic(err)
	}
}

// saveRecords сохраняет текущие записи верификации в файл хранилища
func (r *Repository) saveRecords() {
	// Сериализуем слайс records в JSON с красивыми отступами (2 пробела)
	data, err := json.MarshalIndent(r.records, "", "  ")
	if err != nil {
		// При ошибках сериализации просто выходим (ошибка игнорируется)
		return
	}

	// Записываем данные в файл с правами 0644 (rw-r--r--)
	err = os.WriteFile(r.storageFile, data, 0644)
	if err != nil {
		// При ошибках записи просто выходим (ошибка игнорируется)
		return
	}
}
