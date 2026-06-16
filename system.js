const WindowManager = {
    topZ: 100,
    openedApps: {},

    open(id) {
        System.closeLaunchpad();
        
        let win = document.getElementById(`win-${id}`);
        const dockItem = document.getElementById(`dock-${id}`);
        
        if (!win) {
            // Ленивая инициализация окна по манифесту (NW.js подход)
            const meta = AppManifest[id];
            if (!meta) return;

            win = document.createElement('div');
            win.id = `win-${id}`;
            win.className = `mac-window ${meta.bg}`;
            win.style.width = `${meta.width}px`;
            win.style.height = `${meta.height}px`;
            
            // Задаем стартовую позицию
            const rx = Math.random() * 80 + 100;
            const ry = Math.random() * 80 + 80;
            win.style.transform = `translate(${rx}px, ${ry}px)`;
            win.dataset.x = rx;
            win.dataset.y = ry;

            win.innerHTML = `
                <div class="window-header h-7 dark-mac-glass flex items-center px-3 justify-between cursor-move text-zinc-300 font-medium text-xs select-none">
                    <div class="flex space-x-2 items-center">
                        <button onclick="WindowManager.close('${id}')" class="traffic-light bg-red-500 hover:bg-red-600"></button>
                        <button onclick="WindowManager.minimize('${id}')" class="traffic-light bg-yellow-500 hover:bg-yellow-600"></button>
                        <button class="traffic-light bg-green-500 hover:bg-green-600"></button>
                    </div>
                    <div class="absolute left-1/2 -translate-x-1/2 text-zinc-400 font-sans pointer-events-none">${meta.title}</div>
                    <div class="w-12"></div>
                </div>
                <div class="flex-1 overflow-hidden relative p-1">${meta.html}</div>
            `;
            
            document.getElementById('desktop').appendChild(win);
            this.initDrag(win);
            if(meta.init) meta.init(win);
        }

        win.classList.add('active');
        if(dockItem) dockItem.classList.add('running');
        this.focus(id);
    },

    close(id) {
        const win = document.getElementById(`win-${id}`);
        const dockItem = document.getElementById(`dock-${id}`);
        if(win) {
            win.remove(); // Уничтожаем процесс
            delete this.openedApps[id];
        }
        if(dockItem) dockItem.classList.remove('running');
    },

    minimize(id) {
        const win = document.getElementById(`win-${id}`);
        if(win) win.classList.remove('active');
    },

    focus(id) {
        const win = document.getElementById(`win-${id}`);
        if(win) {
            this.topZ += 1;
            win.style.zIndex = this.topZ;
            document.getElementById('active-app-title').textContent = id.toUpperCase();
        }
    },

    initDrag(win) {
        const header = win.querySelector('.window-header');
        let isDragging = false;
        let startX, startY;

        header.addEventListener('mousedown', (e) => {
            if(e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
            isDragging = true;
            this.focus(win.id.replace('win-', ''));
            
            startX = e.clientX - parseFloat(win.dataset.x);
            startY = e.clientY - parseFloat(win.dataset.y);
            
            const move = (ev) => {
                if(!isDragging) return;
                let nx = ev.clientX - startX;
                let ny = ev.clientY - startY;
                if(ny < 24) ny = 24; // Барьер верхнего меню
                win.style.transform = `translate(${nx}px, ${ny}px)`;
                win.dataset.x = nx;
                win.dataset.y = ny;
            };
            
            const stop = () => {
                isDragging = false;
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', stop);
            };
            
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', stop);
        });
        
        win.addEventListener('mousedown', () => this.focus(win.id.replace('win-', '')));
    }
};

const System = {
    lpOpen: false,

    init() {
        // Часы
        const clock = document.getElementById('clock');
        const update = () => {
            clock.textContent = new Date().toLocaleDateString('ru-RU', {
                weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
            });
        };
        setInterval(update, 30000);
        update();

        // Автоматическое открытие терминала при старте
        WindowManager.open('terminal');
    },

    toggleLaunchpad() {
        const lp = document.getElementById('launchpad');
        this.lpOpen = !this.lpOpen;
        if(this.lpOpen) {
            lp.classList.remove('hidden');
            setTimeout(() => { lp.classList.add('opacity-100'); }, 10);
        } else {
            this.closeLaunchpad();
        }
    },

    closeLaunchpad() {
        const lp = document.getElementById('launchpad');
        lp.classList.remove('opacity-100');
        this.lpOpen = false;
        setTimeout(() => { lp.classList.add('hidden'); }, 300);
    },

    triggerKernelPanic() {
        document.getElementById('kernel-panic').classList.remove('hidden');
    }
};

document.addEventListener('DOMContentLoaded', () => System.init());