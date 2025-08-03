/**
 * Todo 관리 어플리케이션 클래스
 * 할 일의 추가, 삭제, 완료 상태 변경, 필터링 등의 기능을 제공합니다.
 * 날짜 기능이 추가되어 마감일 설정과 지연 상태 관리가 가능합니다.
 * 달력 뷰 기능이 추가되어 월별로 할 일을 시각적으로 확인할 수 있습니다.
 * 제목과 본문을 분리하여 더 상세한 할 일 관리가 가능합니다.
 */
class TodoApp {
    /**
     * TodoApp 생성자
     * 어플리케이션 초기화 시 실행되는 메서드
     */
    constructor() {
        // 메모리에서 할 일 목록을 초기화합니다
        this.todos = [];
        
        // 현재 선택된 필터 상태 (all, pending, completed, today, overdue)
        this.currentFilter = 'all';
        // 현재 뷰 모드 (list, calendar)
        this.currentView = 'calendar';
        // 달력에서 현재 표시 중인 년월
        this.currentDate = new Date(2025, 5, 1); // 2025년 6월로 초기 설정
        // 현재 상세보기 중인 할 일 ID
        this.currentDetailTodoId = null;
        
        // DOM 요소들을 초기화합니다
        this.initElements();
        
        // 달력 그리드가 존재하는지 확인하고 초기화합니다
        if (!this.calendarGrid) {
            console.error('Calendar grid element not found');
            return;
        }
        
        // 이벤트 리스너들을 등록합니다
        this.initEventListeners();
        
        // 달력을 먼저 렌더링합니다
        this.renderCalendar();
        
        // 오늘의 할 일을 렌더링합니다
        this.renderTodaysTodos();
        
        // 나머지 UI를 업데이트합니다
        this.render();
    }

    /**
     * 2025년 6-7월의 샘플 할 일 데이터를 생성하는 메서드
     */
    generateSampleTodos() {
        const sampleTasks = [
            { title: '주간 회의', tags: ['업무', '회의'], description: '팀 주간 업무 보고 및 계획 수립' },
            { title: '보고서 작성', tags: ['업무', '중요'], description: '프로젝트 진행 상황 보고서 작성' },
            { title: '운동하기', tags: ['건강', '개인'], description: '헬스장에서 1시간 운동' },
            { title: '영어 공부', tags: ['학습', '자기계발'], description: '영어 회화 연습 30분' },
            { title: '식료품 구매', tags: ['쇼핑', '개인'], description: '주간 식료품 장보기' },
            { title: '독서', tags: ['취미', '자기계발'], description: '새로 산 책 읽기' },
            { title: '병원 예약', tags: ['건강', '중요'], description: '정기 건강검진 예약' },
            { title: '집안 청소', tags: ['개인', '집'], description: '주말 대청소' },
            { title: '친구 만나기', tags: ['개인', '약속'], description: '친구들과 저녁 식사' },
            { title: '코딩 연습', tags: ['학습', '자기계발'], description: '알고리즘 문제 풀기' },
            { title: '요가 수업', tags: ['건강', '취미'], description: '요가 수업 참여' },
            { title: '프로젝트 미팅', tags: ['업무', '회의'], description: '신규 프로젝트 기획 회의' },
            { title: '블로그 작성', tags: ['취미', '자기계발'], description: '주간 블로그 포스팅' },
            { title: '온라인 강의', tags: ['학습', '자기계발'], description: '새로운 기술 학습' },
            { title: '치과 방문', tags: ['건강', '중요'], description: '정기 치과 검진' },
            { title: '자료 조사', tags: ['업무', '학습'], description: '시장 동향 조사' },
            { title: '가족 식사', tags: ['개인', '약속'], description: '가족과 주말 저녁 식사' },
            { title: '명상하기', tags: ['건강', '취미'], description: '20분 명상으로 하루 시작' },
            { title: '재무 계획', tags: ['개인', '중요'], description: '월간 재무 계획 수립' },
            { title: '음악 감상', tags: ['취미', '개인'], description: '좋아하는 음악 감상하기' }
        ];

        const startDate = new Date(2025, 5, 1); // 2025년 6월 1일
        const endDate = new Date(2025, 6, 31); // 2025년 7월 31일
        
        // 각 주의 시작일(월요일)을 구합니다
        const mondays = [];
        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 1); // 첫 번째 월요일로 이동
        
        while (currentDate <= endDate) {
            mondays.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 7);
        }

        // 각 주마다 6개의 할 일을 생성합니다
        mondays.forEach(monday => {
            // 이번 주의 할 일들을 무작위로 선택
            const weekTasks = [...sampleTasks]
                .sort(() => Math.random() - 0.5)
                .slice(0, 6);
            
            // 선택된 할 일들을 이번 주 날짜들에 무작위로 배정
            weekTasks.forEach(task => {
                const taskDate = new Date(monday);
                // 월요일부터 토요일 중 무작위 선택
                taskDate.setDate(taskDate.getDate() + Math.floor(Math.random() * 6));
                
                const todo = {
                    id: Date.now() + Math.random(),
                    title: task.title,
                    description: task.description,
                    completed: Math.random() < 0.3, // 30% 확률로 완료 상태
                    createdAt: taskDate.toLocaleDateString('ko-KR'),
                    dueDate: this.formatDateToString(taskDate),
                    tags: task.tags
                };
                
                this.todos.push(todo);
            });
        });

        // 날짜순으로 정렬
        this.todos.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    }

    /**
     * DOM 요소들을 찾아서 클래스 속성에 저장합니다
     * 자주 사용되는 요소들을 미리 찾아두어 성능을 향상시킵니다
     */
    initElements() {
        // 할 일 추가 관련 요소들
        this.addTodoBtn = document.getElementById('add-todo-btn');
        this.addTodoModal = document.getElementById('add-todo-modal');
        this.closeAddModalBtn = document.getElementById('close-add-modal');
        this.cancelAddTodoBtn = document.getElementById('cancel-add-todo');
        this.todoForm = document.getElementById('todo-form');
        this.todoTitle = document.getElementById('todo-title');
        this.todoDescription = document.getElementById('todo-description');
        this.todoDate = document.getElementById('todo-date');
        this.todoTags = document.getElementById('todo-tags');
        
        // 오늘의 할 일 관련 요소들
        this.todaysTodos = document.getElementById('todays-todos');
        this.todaysEmptyState = document.getElementById('todays-empty-state');
        
        // 할 일 목록을 표시할 ul 요소
        this.todoList = document.getElementById('todo-list');
        // 할 일이 없을 때 표시할 빈 상태 메시지
        this.emptyState = document.getElementById('empty-state');
        // 필터 버튼들 (전체, 미완료, 완료, 오늘, 지연)
        this.filterBtns = document.querySelectorAll('.filter-btn');

        
        // 뷰 전환 관련 요소들
        this.viewBtns = document.querySelectorAll('.view-btn');
        this.listView = document.getElementById('list-view');
        this.calendarView = document.getElementById('calendar-view');
        
        // 달력 관련 요소들
        this.prevMonthBtn = document.getElementById('prev-month');
        this.nextMonthBtn = document.getElementById('next-month');
        this.currentMonthYear = document.getElementById('current-month-year');
        this.calendarGrid = document.getElementById('calendar-grid');
        
        // 날짜별 할 일 모달 관련 요소들
        this.todoModal = document.getElementById('todo-modal');
        this.modalDate = document.getElementById('modal-date');
        this.modalTodoList = document.getElementById('modal-todo-list');
        this.closeModalBtn = document.getElementById('close-modal');
        this.currentModalDate = null; // 현재 모달에서 선택된 날짜
        
        // 상세보기 모달 관련 요소들
        this.todoDetailModal = document.getElementById('todo-detail-modal');
        this.closeDetailModalBtn = document.getElementById('close-detail-modal');
        this.detailTitle = document.getElementById('detail-title');
        this.detailDescription = document.getElementById('detail-description');
        this.detailCreated = document.getElementById('detail-created');
        this.detailDueDate = document.getElementById('detail-due-date');
        this.detailStatus = document.getElementById('detail-status');
        this.detailTags = document.getElementById('detail-tags');
        this.editDetailTodoBtn = document.getElementById('edit-detail-todo');
        this.toggleDetailTodoBtn = document.getElementById('toggle-detail-todo');
        this.deleteDetailTodoBtn = document.getElementById('delete-detail-todo');
        
        // 편집 모달 관련 요소들
        this.editTodoModal = document.getElementById('edit-todo-modal');
        this.closeEditModalBtn = document.getElementById('close-edit-modal');
        this.cancelEditTodoBtn = document.getElementById('cancel-edit-todo');
        this.editTodoForm = document.getElementById('edit-todo-form');
        this.editTodoTitle = document.getElementById('edit-todo-title');
        this.editTodoDescription = document.getElementById('edit-todo-description');
        this.editTodoDate = document.getElementById('edit-todo-date');
        this.editTodoTags = document.getElementById('edit-todo-tags');
        
        // 통계 정보를 표시할 요소들
        this.totalCount = document.getElementById('total-count');        // 전체 할 일 개수
        this.pendingCount = document.getElementById('pending-count');    // 미완료 할 일 개수
        this.completedCount = document.getElementById('completed-count'); // 완료된 할 일 개수

        
        // 탭 관련 요소들
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');
        this.weeklyTodos = document.getElementById('weekly-todos');
        this.weeklyEmptyState = document.getElementById('weekly-empty-state');
    }

    /**
     * 사용자 상호작용을 위한 이벤트 리스너들을 등록합니다
     */
    initEventListeners() {
        // 메인 할 일 추가 버튼 클릭 이벤트
        this.addTodoBtn.addEventListener('click', () => {
            this.openAddTodoModal();
        });

        // 할 일 추가 모달 관련 이벤트
        this.closeAddModalBtn.addEventListener('click', () => {
            this.closeAddTodoModal();
        });

        this.cancelAddTodoBtn.addEventListener('click', () => {
            this.closeAddTodoModal();
        });

        this.addTodoModal.addEventListener('click', (e) => {
            if (e.target === this.addTodoModal) {
                this.closeAddTodoModal();
            }
        });

        // 할 일 추가 폼 제출 이벤트
        this.todoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTodo();
        });

        // 필터 버튼 클릭 이벤트
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // 뷰 전환 버튼 클릭 이벤트
        this.viewBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setView(e.target.dataset.view);
            });
        });

        // 달력 네비게이션 이벤트
        this.prevMonthBtn.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        this.nextMonthBtn.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        // 날짜별 할 일 모달 관련 이벤트
        this.closeModalBtn.addEventListener('click', () => {
            this.closeModal();
        });

        this.todoModal.addEventListener('click', (e) => {
            if (e.target === this.todoModal) {
                this.closeModal();
            }
        });

        // 상세보기 모달 관련 이벤트
        this.closeDetailModalBtn.addEventListener('click', () => {
            this.closeDetailModal();
        });

        this.todoDetailModal.addEventListener('click', (e) => {
            if (e.target === this.todoDetailModal) {
                this.closeDetailModal();
            }
        });

        this.editDetailTodoBtn.addEventListener('click', () => {
            console.log('Edit button clicked, currentDetailTodoId:', this.currentDetailTodoId);
            if (this.currentDetailTodoId) {
                this.openEditModal(this.currentDetailTodoId);
            } else {
                console.log('No currentDetailTodoId set');
            }
        });

        this.toggleDetailTodoBtn.addEventListener('click', () => {
            if (this.currentDetailTodoId) {
                this.toggleTodo(this.currentDetailTodoId);
                this.updateDetailModal();
            }
        });

        this.deleteDetailTodoBtn.addEventListener('click', () => {
            if (this.currentDetailTodoId) {
                if (confirm('이 할 일을 삭제하시겠습니까?')) {
                    this.deleteTodo(this.currentDetailTodoId);
                    this.closeDetailModal();
                }
            }
        });

        // 편집 모달 관련 이벤트
        this.closeEditModalBtn.addEventListener('click', () => {
            this.closeEditModal();
        });

        this.cancelEditTodoBtn.addEventListener('click', () => {
            this.closeEditModal();
        });

        this.editTodoModal.addEventListener('click', (e) => {
            if (e.target === this.editTodoModal) {
                this.closeEditModal();
            }
        });

        this.editTodoForm.addEventListener('submit', (e) => {
            console.log('Edit form submitted');
            e.preventDefault();
            this.updateTodo();
        });

        // 편집 모달의 태그 제안 이벤트
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tag-suggestion')) {
                const tag = e.target.dataset.tag;
                if (tag) {
                    // 편집 모달이 열려있는 경우
                    if (this.editTodoModal.style.display === 'flex') {
                        this.addEditTagSuggestion(tag);
                    }
                    // 추가 모달이 열려있는 경우
                    else if (this.addTodoModal.style.display === 'flex') {
                        this.addTagSuggestion(tag);
                    }
                }
            }
        });



        // 탭 전환 이벤트
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setActiveTab(e.target.dataset.tab);
            });
        });
    }

    /**
     * 할 일 추가 모달을 여는 메서드
     * @param {string} presetDate - 미리 설정할 날짜 (선택사항)
     */
    openAddTodoModal(presetDate = null) {
        // 폼 초기화
        this.todoTitle.value = '';
        this.todoDescription.value = '';
        this.todoDate.value = presetDate || '';
        this.todoTags.value = '';
        
        // 모달 표시
        this.addTodoModal.style.display = 'flex';
        
        // 제목 입력 필드에 포커스
        setTimeout(() => {
            this.todoTitle.focus();
        }, 100);
    }

    /**
     * 할 일 추가 모달을 닫는 메서드
     */
    closeAddTodoModal() {
        this.addTodoModal.style.display = 'none';
        // 폼 초기화
        this.todoTitle.value = '';
        this.todoDescription.value = '';
        this.todoDate.value = '';
        this.todoTags.value = '';
    }

    /**
     * 태그 제안을 클릭했을 때 태그 입력 필드에 추가하는 메서드
     * @param {string} tag - 추가할 태그
     */
    addTagSuggestion(tag) {
        const currentTags = this.todoTags.value.trim();
        const tagsArray = currentTags ? currentTags.split(',').map(t => t.trim()) : [];
        
        // 이미 존재하는 태그인지 확인
        if (!tagsArray.includes(tag)) {
            tagsArray.push(tag);
            this.todoTags.value = tagsArray.join(', ');
        }
        
        // 태그 입력 필드에 포커스
        this.todoTags.focus();
    }

    /**
     * 새로운 할 일을 추가하는 메서드
     * 제목과 본문을 분리하여 저장합니다
     */
    addTodo() {
        const title = this.todoTitle.value.trim();
        if (!title) return;

        const description = this.todoDescription.value.trim();
        const dueDate = this.todoDate.value || null;
        const tagsInput = this.todoTags.value.trim();
        const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

        const todo = {
            id: Date.now(),
            title: title,
            description: description,
            completed: false,
            createdAt: new Date().toLocaleDateString('ko-KR'),
            dueDate: dueDate,
            tags: tags
        };

        this.todos.unshift(todo);
        
        // 모달 닫기
        this.closeAddTodoModal();
        
        // 화면 업데이트
        this.renderTodaysTodos();
        this.render();
        
        // 달력 뷰에서 추가한 경우 달력도 업데이트
        if (this.currentView === 'calendar') {
            this.renderCalendar();
        }
    }

    /**
     * 할 일의 완료 상태를 토글하는 메서드
     * @param {string} id - 토글할 할 일의 ID
     */
    toggleTodo(id) {
        // ID를 숫자로 변환 (문자열로 전달된 경우를 위해)
        const numericId = parseFloat(id);
        
        // 해당 ID를 가진 할 일을 찾습니다
        const todo = this.todos.find(t => t.id === numericId);
        if (!todo) return;

        // 완료 상태를 토글합니다
        todo.completed = !todo.completed;
        
        // UI를 업데이트합니다
        this.renderTodaysTodos();
        this.renderWeeklyTodos();
        this.render();

        // 상세보기 모달이 열려있는 경우 업데이트
        if (this.currentDetailTodoId === numericId) {
            this.updateDetailModal();
        }
    }

    /**
     * 할 일을 삭제하는 메서드
     * @param {string} id - 삭제할 할 일의 ID
     */
    deleteTodo(id) {
        // ID를 숫자로 변환 (문자열로 전달된 경우를 위해)
        const numericId = parseFloat(id);
        
        // 삭제 확인
        if (!confirm('정말로 이 할 일을 삭제하시겠습니까?')) {
            return;
        }

        // 해당 ID를 가진 할 일의 인덱스를 찾습니다
        const index = this.todos.findIndex(t => t.id === numericId);
        if (index === -1) return;

        // 할 일을 배열에서 제거합니다
        this.todos.splice(index, 1);
        
        // UI를 업데이트합니다
        this.renderTodaysTodos();
        this.renderWeeklyTodos();
        this.render();

        // 상세보기 모달이 열려있는 경우 닫기
        if (this.currentDetailTodoId === numericId) {
            this.closeDetailModal();
        }
    }

    /**
     * 할 일 상세보기 모달을 여는 메서드
     * @param {number} id - 상세보기할 할 일의 ID
     */
    openDetailModal(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        this.currentDetailTodoId = id;
        this.updateDetailModal();
        this.todoDetailModal.style.display = 'flex';
    }

    /**
     * 상세보기 모달의 내용을 업데이트하는 메서드
     */
    updateDetailModal() {
        const todo = this.todos.find(t => t.id === this.currentDetailTodoId);
        if (!todo) return;

        this.detailTitle.textContent = todo.title;
        this.detailDescription.textContent = todo.description || '상세 내용이 없습니다.';
        this.detailCreated.textContent = todo.createdAt;
        
        if (todo.dueDate) {
            const formattedDate = this.formatDueDate(todo.dueDate);
            const dateStatus = this.getDateStatus(todo);
            let statusText = formattedDate;
            if (dateStatus === 'overdue') {
                statusText += ' (지연됨)';
            } else if (dateStatus === 'today') {
                statusText += ' (오늘 마감)';
            }
            this.detailDueDate.textContent = statusText;
        } else {
            this.detailDueDate.textContent = '마감일 없음';
        }

        this.detailStatus.textContent = todo.completed ? '완료됨' : '미완료';
        this.toggleDetailTodoBtn.textContent = todo.completed ? '미완료로 변경' : '완료로 변경';

        // 태그 표시
        if (todo.tags && todo.tags.length > 0) {
            this.detailTags.innerHTML = todo.tags.map(tag => 
                `<span class="detail-tag">${this.escapeHtml(tag)}</span>`
            ).join('');
        } else {
            this.detailTags.innerHTML = '<span class="no-tags">태그 없음</span>';
        }
    }

    /**
     * 상세보기 모달을 닫는 메서드
     */
    closeDetailModal() {
        this.todoDetailModal.style.display = 'none';
        this.currentDetailTodoId = null;
    }

    /**
     * 현재 활성화된 필터를 설정하는 메서드
     * @param {string} filter - 설정할 필터 ('all', 'pending', 'completed', 'today', 'overdue')
     */
    setFilter(filter) {
        // 제거된 필터가 선택된 경우 "전체"로 리셋
        if (filter === 'today' || filter === 'overdue') {
            filter = 'all';
        }
        
        this.currentFilter = filter;
        
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.render();
    }

    /**
     * 현재 뷰를 변경하는 메서드
     * @param {string} view - 변경할 뷰 ('list' 또는 'calendar')
     */
    setView(view) {
        // 뷰 버튼 상태 업데이트
        this.viewBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.view === view) {
                btn.classList.add('active');
            }
        });

        // 현재 뷰 업데이트
        this.currentView = view;

        // 뷰에 따라 화면 업데이트
        if (view === 'list') {
            this.listView.style.display = 'block';
            this.calendarView.style.display = 'none';
        } else {
            this.listView.style.display = 'none';
            this.calendarView.style.display = 'block';
            this.renderCalendar(); // 달력 뷰로 전환할 때 명시적으로 달력 렌더링
        }

        // 전체 화면 업데이트
        this.render();
    }



    /**
     * 할 일의 날짜 상태를 확인하는 메서드
     * @param {Object} todo - 확인할 할 일 객체
     * @returns {string} 날짜 상태 ('none', 'today', 'overdue', 'future')
     */
    getDateStatus(todo) {
        if (!todo.dueDate) return 'none';

        const today = this.formatDateToString(new Date());
        const dueDate = todo.dueDate;

        if (dueDate === today) {
            return 'today';
        } else if (dueDate < today) {
            return 'overdue';
        } else {
            return 'future';
        }
    }

    /**
     * 현재 선택된 필터에 따라 할 일 목록을 필터링하여 반환하는 메서드
     * @returns {Array} 필터링된 할 일 배열
     */
    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'completed':
                return this.todos.filter(t => t.completed);
            case 'pending':
                return this.todos.filter(t => !t.completed);
            default:
                return this.todos;
        }
    }

    /**
     * 특정 날짜의 할 일 목록을 반환하는 메서드
     * @param {string} dateString - YYYY-MM-DD 형식의 날짜 문자열
     * @returns {Array} 해당 날짜의 할 일 배열
     */
    getTodosForDate(dateString) {
        return this.todos.filter(todo => todo.dueDate === dateString);
    }

    /**
     * 날짜를 YYYY-MM-DD 형식의 문자열로 변환하는 메서드 (시간대 변환 없음)
     * @param {Date} date - 변환할 Date 객체
     * @returns {string} YYYY-MM-DD 형식의 날짜 문자열
     */
    formatDateToString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * 달력을 렌더링하는 메서드
     */
    renderCalendar() {
        // 달력 그리드가 없으면 렌더링하지 않습니다
        if (!this.calendarGrid) {
            console.error('Cannot render calendar: calendar grid element not found');
            return;
        }

        // 현재 월의 첫 번째 날과 마지막 날을 구합니다
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        // 달력 헤더 업데이트
        if (this.currentMonthYear) {
            this.currentMonthYear.textContent = `${year}년 ${month + 1}월`;
        }
        
        // 달력 시작일 (첫 주의 일요일)
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        // 달력 종료일 (마지막 주의 토요일)
        const endDate = new Date(lastDay);
        endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
        
        // 오늘 날짜
        const today = this.formatDateToString(new Date());
        
        // 달력 그리드 생성
        let calendarHTML = '';
        const currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
            const dateString = this.formatDateToString(currentDate);
            const dayTodos = this.getTodosForDate(dateString);
            const isCurrentMonth = currentDate.getMonth() === month;
            const isToday = dateString === today;
            
            // CSS 클래스 결정
            let dayClasses = ['calendar-day'];
            if (!isCurrentMonth) dayClasses.push('other-month');
            if (isToday) dayClasses.push('today');
            if (dayTodos.length > 0) dayClasses.push('has-todos');
            
            // 할 일 항목들을 렌더링 (최대 3개까지 표시)
            let todosHTML = '';
            const visibleTodos = dayTodos.slice(0, 3);
            const remainingCount = dayTodos.length - visibleTodos.length;
            
            visibleTodos.forEach(todo => {
                const dateStatus = this.getDateStatus(todo);
                let todoClasses = ['day-todo-item'];
                if (todo.completed) todoClasses.push('completed');
                if (dateStatus === 'overdue') todoClasses.push('overdue');
                
                todosHTML += `<div class="${todoClasses.join(' ')}" title="${this.escapeHtml(todo.title)}">${this.escapeHtml(todo.title)}</div>`;
            });
            
            if (remainingCount > 0) {
                todosHTML += `<div class="day-todo-more">+${remainingCount}개 더</div>`;
            }
            
            calendarHTML += `
                <div class="${dayClasses.join(' ')}" data-date="${dateString}" onclick="todoApp.openDayModal('${dateString}')">
                    <div class="day-number">${currentDate.getDate()}</div>
                    <div class="day-todos">${todosHTML}</div>
                </div>
            `;
            
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        // 달력 그리드 업데이트
        this.calendarGrid.innerHTML = calendarHTML;
    }

    /**
     * 특정 날짜의 할 일을 보여주는 모달을 여는 메서드
     * @param {string} dateString - YYYY-MM-DD 형식의 날짜 문자열
     */
    openDayModal(dateString) {
        this.currentModalDate = dateString; // 현재 모달 날짜 저장
        
        const date = new Date(dateString + 'T00:00:00');
        const formattedDate = date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
        
        this.modalDate.textContent = formattedDate;
        
        this.updateDayModal();
        this.todoModal.style.display = 'flex';
    }

    /**
     * 날짜별 할 일 모달의 내용을 업데이트하는 메서드
     */
    updateDayModal() {
        const dayTodos = this.getTodosForDate(this.currentModalDate);
        
        if (dayTodos.length === 0) {
            this.modalTodoList.innerHTML = `
                <div style="text-align: center; color: #999; padding: 20px;">
                    <p>이 날짜에 할 일이 없습니다.</p>
                    <p>위에서 새로운 할 일을 추가해보세요!</p>
                    <button onclick="todoApp.addTodoForDate('${this.currentModalDate}')" 
                            class="modal-empty-add-btn">
                        할 일 추가하기
                    </button>
                </div>
            `;
        } else {
            this.modalTodoList.innerHTML = dayTodos.map(todo => {
                const dateStatus = this.getDateStatus(todo);
                const dateClass = dateStatus === 'overdue' ? 'overdue' : 
                                 dateStatus === 'today' ? 'due-today' : '';
                
                return `
                    <li class="modal-todo-item ${todo.completed ? 'completed' : ''} ${dateClass}" onclick="todoApp.openDetailModal(${todo.id})">
                        <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" 
                             onclick="event.stopPropagation(); todoApp.toggleTodo(${todo.id}); todoApp.updateDayModal()"></div>
                        <div class="todo-content">
                            <span class="todo-title">${this.escapeHtml(todo.title)}</span>
                            ${todo.description ? `<div class="todo-description">${this.escapeHtml(todo.description.substring(0, 100))}${todo.description.length > 100 ? '...' : ''}</div>` : ''}
                            <div class="todo-dates">
                                <span class="todo-created-date">생성: ${todo.createdAt}</span>
                            </div>
                        </div>
                        <button class="todo-delete" onclick="event.stopPropagation(); todoApp.deleteTodo(${todo.id}); todoApp.updateDayModal()" title="삭제">
                            🗑️
                        </button>
                    </li>
                `;
            }).join('');
        }
    }

    /**
     * 날짜별 할 일 모달을 닫는 메서드
     */
    closeModal() {
        this.todoModal.style.display = 'none';
        this.currentModalDate = null;
        // 모달이 닫힌 후 달력을 다시 렌더링하여 변경사항을 반영
        if (this.currentView === 'calendar') {
            this.renderCalendar();
        }
    }

    /**
     * 할 일 통계 정보를 업데이트하는 메서드
     */
    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const pending = total - completed;

        this.totalCount.textContent = `전체: ${total}`;
        this.pendingCount.textContent = `미완료: ${pending}`;
        this.completedCount.textContent = `완료: ${completed}`;
    }

    /**
     * 마감일을 한국어 형식으로 포맷하는 메서드
     * @param {string} dateString - YYYY-MM-DD 형식의 날짜 문자열
     * @returns {string} 포맷된 날짜 문자열
     */
    formatDueDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString + 'T00:00:00');
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        const dateStr = dateString;
        const todayStr = this.formatDateToString(today);
        const tomorrowStr = this.formatDateToString(tomorrow);
        
        if (dateStr === todayStr) {
            return '오늘';
        } else if (dateStr === tomorrowStr) {
            return '내일';
        } else {
            return date.toLocaleDateString('ko-KR', {
                month: 'short',
                day: 'numeric'
            });
        }
    }

    /**
     * 텍스트를 자르고 말줄임표를 추가하는 메서드
     * @param {string} text - 자를 텍스트
     * @param {number} maxLength - 최대 길이
     * @returns {string} 잘린 텍스트
     */
    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    /**
     * 화면을 렌더링하는 메인 메서드
     * 필터링된 할 일 목록을 화면에 표시하고 통계를 업데이트합니다
     */
    render() {
        // 필터링된 할 일 목록을 가져옵니다
        const filteredTodos = this.getFilteredTodos();
        
        // 통계 정보를 업데이트합니다
        this.updateStats();
        
        // 현재 뷰에 따라 화면을 업데이트합니다
        if (this.currentView === 'list') {
            this.listView.style.display = 'block';
            this.calendarView.style.display = 'none';
            
            // 할 일이 없는 경우 빈 상태를 표시합니다
            if (filteredTodos.length === 0) {
                this.todoList.style.display = 'none';
                this.emptyState.style.display = 'block';
            } else {
                this.todoList.style.display = 'block';
                this.emptyState.style.display = 'none';
                
                // 할 일 목록을 렌더링합니다
                this.todoList.innerHTML = filteredTodos.map(todo => {
                    const status = this.getDateStatus(todo);
                    const statusClass = status === 'overdue' ? 'overdue' : 
                                      status === 'today' ? 'due-today' : '';
                    
                    return `
                        <li class="todo-item ${todo.completed ? 'completed' : ''} ${statusClass}" 
                            data-id="${todo.id}">
                            <div class="todo-content" data-id="${todo.id}">
                                <div class="todo-title">${this.escapeHtml(todo.title)}</div>
                                ${todo.description ? 
                                    `<div class="todo-description ${todo.description.length > 100 ? 'has-more' : ''}">${
                                        this.escapeHtml(this.truncateText(todo.description, 100))
                                    }</div>` 
                                    : ''}
                                <div class="todo-tags">
                                    ${todo.tags ? todo.tags.map(tag => 
                                        `<span class="todo-tag">${this.escapeHtml(tag)}</span>`
                                    ).join('') : ''}
                                </div>
                                <div class="todo-dates">
                                    <span class="todo-created-date">
                                        생성: ${todo.createdAt}
                                    </span>
                                    <span class="todo-due-date ${statusClass}">
                                        마감: ${this.formatDueDate(todo.dueDate)}
                                    </span>
                                </div>
                            </div>
                            <div class="todo-actions">
                                <button class="todo-action-btn todo-complete-btn ${todo.completed ? 'completed' : ''}"
                                        data-id="${todo.id}"
                                        ${todo.completed ? 'disabled' : ''}>
                                    ${todo.completed ? '완료됨' : '완료하기'}
                                </button>
                                <button class="todo-action-btn todo-delete-btn"
                                        data-id="${todo.id}">
                                    삭제하기
                                </button>
                            </div>
                        </li>
                    `;
                }).join('');

                // 이벤트 리스너 추가
                // 할 일 항목 전체 클릭 시 상세 모달 열기
                this.todoList.querySelectorAll('.todo-item').forEach(item => {
                    item.addEventListener('click', (e) => {
                        const id = parseFloat(e.currentTarget.dataset.id);
                        this.openDetailModal(id);
                    });
                });

                this.todoList.querySelectorAll('.todo-complete-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const id = parseFloat(e.currentTarget.dataset.id);
                        this.toggleTodo(id);
                    });
                });

                this.todoList.querySelectorAll('.todo-delete-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const id = parseFloat(e.currentTarget.dataset.id);
                        this.deleteTodo(id);
                    });
                });
            }
        } else {
            this.listView.style.display = 'none';
            this.calendarView.style.display = 'block';
            this.renderCalendar();
        }
    }

    /**
     * HTML 특수 문자를 이스케이프하는 메서드
     * @param {string} text - 이스케이프할 텍스트
     * @returns {string} 이스케이프된 텍스트
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }





    /**
     * 특정 날짜에 할 일을 추가하기 위해 할 일 추가 모달을 여는 메서드
     * @param {string} dateString - YYYY-MM-DD 형식의 날짜 문자열
     */
    addTodoForDate(dateString) {
        // 기존 모달 닫기
        this.closeModal();
        
        // 할 일 추가 모달 열기 (날짜 미리 설정)
        this.openAddTodoModal(dateString);
    }

    /**
     * 오늘의 할 일을 렌더링하는 메서드
     */
    renderTodaysTodos() {
        const todayStr = this.formatDateToString(new Date());
        const todaysTodos = this.getTodosForDate(todayStr);
        
        if (todaysTodos.length === 0) {
            this.todaysTodos.style.display = 'none';
            this.todaysEmptyState.style.display = 'block';
            return;
        }

        this.todaysTodos.style.display = 'block';
        this.todaysEmptyState.style.display = 'none';

        this.todaysTodos.innerHTML = todaysTodos.map(todo => {
            return `
                <div class="today-todo-item ${todo.completed ? 'completed' : ''}" 
                     data-id="${todo.id}">
                    <div class="todo-content" data-id="${todo.id}">
                        <div class="todo-title">${this.escapeHtml(todo.title)}</div>
                        ${todo.description ? 
                            `<div class="todo-description">${this.escapeHtml(this.truncateText(todo.description, 100))}</div>` 
                            : ''}
                        <div class="todo-tags">
                            ${todo.tags ? todo.tags.map(tag => 
                                `<span class="todo-tag">${this.escapeHtml(tag)}</span>`
                            ).join('') : ''}
                        </div>
                    </div>
                    <div class="todo-actions">
                        <button class="todo-action-btn todo-complete-btn ${todo.completed ? 'completed' : ''}"
                                data-id="${todo.id}"
                                ${todo.completed ? 'disabled' : ''}>
                            ${todo.completed ? '완료됨' : '완료하기'}
                        </button>
                        <button class="todo-action-btn todo-delete-btn"
                                data-id="${todo.id}">
                            삭제하기
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // 이벤트 리스너 추가
        // 할 일 항목 전체 클릭 시 상세 모달 열기
        this.todaysTodos.querySelectorAll('.today-todo-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const id = parseFloat(e.currentTarget.dataset.id);
                this.openDetailModal(id);
            });
        });

        this.todaysTodos.querySelectorAll('.todo-complete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const id = parseFloat(e.currentTarget.dataset.id);
                this.toggleTodo(id);
            });
        });

        this.todaysTodos.querySelectorAll('.todo-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const id = parseFloat(e.currentTarget.dataset.id);
                this.deleteTodo(id);
            });
        });
    }

    /**
     * 활성화된 탭을 변경하는 메서드
     * @param {string} tabId - 활성화할 탭의 ID
     */
    setActiveTab(tabId) {
        // 탭 버튼들이 존재하지 않으면 아무것도 하지 않음
        if (!this.tabBtns || this.tabBtns.length === 0) {
            return;
        }

        // 모든 탭 버튼에서 active 클래스 제거
        this.tabBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabId) {
                btn.classList.add('active');
            }
        });

        // 모든 탭 컨텐츠에서 active 클래스 제거
        this.tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `${tabId}-tab`) {
                content.classList.add('active');
            }
        });

        // 탭에 따라 할 일 목록 렌더링 (무한 재귀 방지)
        if (tabId === 'week') {
            this.renderWeeklyTodos();
        }
    }

    /**
     * 이번주의 할 일 목록을 가져오는 메서드
     * @returns {Array} 이번주의 할 일 목록
     */
    getWeeklyTodos() {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // 이번주 일요일
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // 이번주 토요일

        return this.todos.filter(todo => {
            const dueDate = new Date(todo.dueDate);
            return dueDate >= startOfWeek && dueDate <= endOfWeek;
        });
    }

    renderWeeklyTodos() {
        // 이번주 할 일 요소가 존재하지 않으면 아무것도 하지 않음
        if (!this.weeklyTodos) {
            return;
        }

        const weeklyTodos = this.getWeeklyTodos();
        
        if (weeklyTodos.length === 0) {
            this.weeklyTodos.style.display = 'none';
            if (this.weeklyEmptyState) {
                this.weeklyEmptyState.style.display = 'block';
            }
            return;
        }

        this.weeklyTodos.style.display = 'block';
        if (this.weeklyEmptyState) {
            this.weeklyEmptyState.style.display = 'none';
        }

        // 날짜별로 정렬
        weeklyTodos.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

        this.weeklyTodos.innerHTML = weeklyTodos.map(todo => {
            const status = this.getDateStatus(todo);
            const statusClass = status === 'overdue' ? 'overdue' : 
                              status === 'today' ? 'due-today' : '';
            
            return `
                <div class="today-todo-item ${todo.completed ? 'completed' : ''} ${statusClass}" 
                     data-id="${todo.id}">
                    <div class="todo-content">
                        <div class="todo-title">${this.escapeHtml(todo.title)}</div>
                        ${todo.description ? 
                            `<div class="todo-description">${this.escapeHtml(this.truncateText(todo.description, 100))}</div>` 
                            : ''}
                        <div class="todo-tags">
                            ${todo.tags ? todo.tags.map(tag => 
                                `<span class="todo-tag">${this.escapeHtml(tag)}</span>`
                            ).join('') : ''}
                        </div>
                        <div class="todo-dates">
                            <span class="todo-due-date ${statusClass}">
                                ${this.formatDueDate(todo.dueDate)}
                            </span>
                        </div>
                    </div>
                    <div class="todo-actions">
                        <button class="todo-action-btn todo-complete-btn ${todo.completed ? 'completed' : ''}"
                                data-id="${todo.id}"
                                ${todo.completed ? 'disabled' : ''}>
                            ${todo.completed ? '완료됨' : '완료하기'}
                        </button>
                        <button class="todo-action-btn todo-delete-btn"
                                data-id="${todo.id}">
                            삭제하기
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // 이벤트 리스너 추가
        this.weeklyTodos.querySelectorAll('.todo-complete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const id = parseFloat(e.currentTarget.dataset.id);
                this.toggleTodo(id);
            });
        });

        this.weeklyTodos.querySelectorAll('.todo-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const id = parseFloat(e.currentTarget.dataset.id);
                this.deleteTodo(id);
            });
        });
    }

    /**
     * 할 일 편집 모달을 여는 메서드
     * @param {number} id - 편집할 할 일의 ID
     */
    openEditModal(id) {
        console.log('openEditModal called with id:', id);
        console.log('editTodoTitle element:', this.editTodoTitle);
        console.log('editTodoForm element:', this.editTodoForm);
        
        const todo = this.todos.find(t => t.id === id);
        if (!todo) {
            console.log('Todo not found for id:', id);
            return;
        }

        console.log('Found todo:', todo);

        // ID를 별도로 저장 (closeDetailModal에서 null로 설정되기 전에)
        this.currentEditTodoId = id;

        // 폼에 기존 값 설정
        this.editTodoTitle.value = todo.title;
        this.editTodoDescription.value = todo.description || '';
        this.editTodoDate.value = todo.dueDate || '';
        this.editTodoTags.value = todo.tags ? todo.tags.join(', ') : '';
        
        console.log('Form values set');
        
        // 상세 모달만 숨기기 (currentDetailTodoId는 유지)
        this.todoDetailModal.style.display = 'none';
        
        console.log('Detail modal hidden');
        
        // 편집 모달 표시
        this.editTodoModal.style.display = 'flex';
        
        console.log('Edit modal should be visible now');
        
        // 제목 입력 필드에 포커스
        setTimeout(() => {
            this.editTodoTitle.focus();
        }, 100);
    }

    /**
     * 할 일 편집 모달을 닫는 메서드
     */
    closeEditModal() {
        this.editTodoModal.style.display = 'none';
        this.currentEditTodoId = null;
        // 폼 초기화
        this.editTodoTitle.value = '';
        this.editTodoDescription.value = '';
        this.editTodoDate.value = '';
        this.editTodoTags.value = '';
    }

    /**
     * 편집 태그 제안을 클릭했을 때 태그 입력 필드에 추가하는 메서드
     * @param {string} tag - 추가할 태그
     */
    addEditTagSuggestion(tag) {
        const currentTags = this.editTodoTags.value.trim();
        const tagsArray = currentTags ? currentTags.split(',').map(t => t.trim()) : [];
        
        // 이미 존재하는 태그인지 확인
        if (!tagsArray.includes(tag)) {
            tagsArray.push(tag);
            this.editTodoTags.value = tagsArray.join(', ');
        }
        
        // 태그 입력 필드에 포커스
        this.editTodoTags.focus();
    }

    /**
     * 할 일을 수정하는 메서드
     */
    updateTodo() {
        console.log('updateTodo called');
        console.log('currentEditTodoId:', this.currentEditTodoId);
        console.log('currentDetailTodoId:', this.currentDetailTodoId);
        
        const todoId = this.currentEditTodoId || this.currentDetailTodoId;
        
        if (!todoId) {
            console.log('No todo ID available, returning');
            return;
        }

        const title = this.editTodoTitle.value.trim();
        console.log('Title from form:', title);
        
        if (!title) {
            console.log('No title, returning');
            return;
        }

        const todo = this.todos.find(t => t.id === todoId);
        if (!todo) {
            console.log('Todo not found for todoId:', todoId);
            return;
        }

        console.log('Found todo to update:', todo);

        const description = this.editTodoDescription.value.trim();
        const dueDate = this.editTodoDate.value || null;
        const tagsInput = this.editTodoTags.value.trim();
        const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

        console.log('New values:', { title, description, dueDate, tags });

        // 할 일 정보 업데이트
        todo.title = title;
        todo.description = description;
        todo.dueDate = dueDate;
        todo.tags = tags;

        console.log('Todo updated:', todo);
        
        // 모달 닫기
        this.closeEditModal();
        console.log('Edit modal closed');
        
        // 화면 업데이트
        this.renderTodaysTodos();
        this.renderWeeklyTodos();
        this.render();
        console.log('UI updated');
        
        // 달력 뷰에서 수정한 경우 달력도 업데이트
        if (this.currentView === 'calendar') {
            this.renderCalendar();
            console.log('Calendar updated');
        }

        // 상세 모달이 열려있었다면 다시 열기
        this.openDetailModal(todoId);
        console.log('Detail modal reopened');
    }
}

// ============================================================================
// 어플리케이션 초기화 및 전역 이벤트 리스너
// ============================================================================

/**
 * DOM이 완전히 로드된 후 TodoApp 인스턴스를 생성합니다
 */
document.addEventListener('DOMContentLoaded', () => {
    window.todoApp = new TodoApp();
});

/**
 * 키보드 단축키를 처리하는 전역 이벤트 리스너
 */
document.addEventListener('keydown', (e) => {
    // Ctrl+Enter 또는 Cmd+Enter: 할 일 빠른 추가
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        // 일반 폼에서 할 일 추가
        const todoTitle = document.getElementById('todo-title');
        if (todoTitle.value.trim()) {
            todoApp.addTodo();
        }
    }
    
    // ESC 키: 모달 닫기
    if (e.key === 'Escape') {
        // 할 일 추가 모달이 열려있으면 모달을 닫습니다
        const addTodoModal = document.getElementById('add-todo-modal');
        if (addTodoModal.style.display === 'flex') {
            todoApp.closeAddTodoModal();
            return;
        }
        
        // 상세보기 모달이 열려있으면 모달을 닫습니다
        const detailModal = document.getElementById('todo-detail-modal');
        if (detailModal.style.display === 'flex') {
            todoApp.closeDetailModal();
            return;
        }
        
        // 날짜별 할 일 모달이 열려있으면 모달을 닫습니다
        const modal = document.getElementById('todo-modal');
        if (modal.style.display === 'flex') {
            todoApp.closeModal();
            return;
        }
    }
    
    // 달력 뷰에서 화살표 키로 월 이동
    if (todoApp.currentView === 'calendar') {
        if (e.key === 'ArrowLeft' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            todoApp.currentDate.setMonth(todoApp.currentDate.getMonth() - 1);
            todoApp.renderCalendar();
        } else if (e.key === 'ArrowRight' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            todoApp.currentDate.setMonth(todoApp.currentDate.getMonth() + 1);
            todoApp.renderCalendar();
        }
    }
});

/**
 * PWA 지원을 위한 서비스워커 등록 (주석 처리)
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // 필요시 서비스워커를 등록할 수 있습니다
        // navigator.serviceWorker.register('/sw.js');
    });
} 