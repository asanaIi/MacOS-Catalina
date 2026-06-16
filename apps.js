const AppManifest = {
    terminal: {
        title: "Terminal (Unix Darwin)",
        width: 600, height: 400,
        bg: "bg-zinc-950 text-mono text-green-400 p-4 font-mono",
        html: `
            <div class="h-full flex flex-col">
                <div class="overflow-y-auto flex-1 space-y-1" id="term-output">
                    <div class="text-white">MacOS Catalina (Darwin Kernel Version 24.5.0)</div>
                    <div class="text-zinc-500">Введите 'help' для просмотра команд.</div>
                </div>
                <div class="flex items-center mt-2 text-xs">
                    <span class="text-cyan-400 mr-2">catalana@apple:~ %</span>
                    <input type="text" id="term-input" class="flex-1 bg-transparent border-none outline-none text-green-400 font-mono" autofocus>
                </div>
            </div>
        `,
        init(win) {
            const input = win.querySelector('#term-input');
            const out = win.querySelector('#term-output');
            let currentDir = "~";

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const line = input.value.trim();
                    if(!line) return;
                    
                    const div = document.createElement('div');
                    div.className = "text-zinc-400";
                    div.textContent = `catalana@apple:${currentDir} % ${line}`;
                    out.appendChild(div);
                    
                    const args = line.split(' ');
                    const cmd = args[0].toLowerCase();
                    const response = document.createElement('div');
                    response.className = "text-green-300";

                    switch(cmd) {
                        case 'help':
                            response.innerHTML = "Команды: ls, cd, clear, pwd, uname -a, say [текст], neofetch";
                            break;
                        case 'uname':
                            response.textContent = args[1] === '-a' ? "Darwin apple 24.5.0 Darwin Kernel Version 24.5.0: root:xnu/RELEASE_X86_64 x86_64" : "Darwin";
                            break;
                        case 'neofetch':
                            response.innerHTML = `
                                <span class="text-red-400"> mACOS cATALANA v10.15</span><br>
                                <span class="text-zinc-400">--------------------</span><br>
                                <b>OS:</b> macOS Catalina Sim (Vercel Build)<br>
                                <b>Kernel:</b> xnu-24.5.0<br>
                                <b>Shell:</b> zsh 5.8<br>
                                <b>CPU:</b> Intel Core i5-2300 @ 2.80GHz<br>
                                <b>GPU:</b> NVIDIA GeForce GT 240<br>
                                <b>Memory:</b> 6.00 GB RAM
                            `;
                            break;
                        case 'clear': out.innerHTML = ''; break;
                        case 'pwd': response.textContent = `/Users/catalana/${currentDir}`; break;
                        case 'say':
                            response.textContent = "🔊 " + args.slice(1).join(' ');
                            const speech = new SpeechSynthesisUtterance(args.slice(1).join(' '));
                            speech.lang = 'en-US';
                            window.speechSynthesis.speak(speech);
                            break;
                        default:
                            response.className = "text-red-400";
                            response.textContent = `catalana: command not found: ${cmd}`;
                    }
                    if(cmd !== 'clear') out.appendChild(response);
                    input.value = '';
                    out.scrollTop = out.scrollHeight;
                }
            });
        }
    },

    console: {
        title: "Консоль (Просмотр логов)",
        width: 500, height: 350,
        bg: "bg-zinc-900 text-xs font-mono p-4 text-zinc-300",
        html: `<div class="h-full overflow-y-auto space-y-1" id="console-logs"></div>`,
        init(win) {
            const container = win.querySelector('#console-logs');
            const subsystems = ["kernel", "WindowServer", "CoreAudio", "Vercel-Router"];
            setInterval(() => {
                if(win.classList.contains('active')) {
                    const sub = subsystems[Math.floor(Math.random()*subsystems.length)];
                    const div = document.createElement('div');
                    div.innerHTML = `<span class="text-zinc-500">[${new Date().toLocaleTimeString()}]</span> <span class="text-blue-400">${sub}:</span> Лог операции деплоя OK.`;
                    container.appendChild(div);
                    container.scrollTop = container.scrollHeight;
                }
            }, 2000);
        }
    },

    safari: {
        title: "Safari",
        width: 800, height: 500,
        bg: "bg-white text-black flex flex-col",
        html: `
            <div class="bg-zinc-200 border-b border-zinc-300 p-2 flex items-center space-x-2 text-xs">
                <input type="text" id="safari-url" value="Поиск в Википедии через API" class="flex-1 bg-white border rounded px-3 py-1 outline-none text-zinc-600">
                <button id="safari-search-btn" class="bg-blue-600 text-white px-3 py-1 rounded">Искать</button>
            </div>
            <div class="flex-1 p-6 overflow-y-auto" id="safari-body">
                <h1 class="text-2xl font-bold mb-2">Добро пожаловать в Safari</h1>
                <p class="text-zinc-600 text-sm">Введите поисковый запрос в строку выше. Мы используем живой API Википедии для динамической сборки страниц прямо в код приложения!</p>
            </div>
        `,
        init(win) {
            const btn = win.querySelector('#safari-search-btn');
            const input = win.querySelector('#safari-url');
            const body = win.querySelector('#safari-body');

            btn.addEventListener('click', () => {
                const query = input.value.trim();
                if(!query) return;
                body.innerHTML = "<p class='text-zinc-500 animate-pulse'>Загрузка статьи...</p>";
                
                // Подгружаем реальные данные из Wikipedia API без использования iframe
                fetch(`https://ru.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`)
                    .then(res => res.json())
                    .then(data => {
                        if(data.title) {
                            body.innerHTML = `
                                <h1 class="text-3xl font-serif border-b pb-2 font-bold">${data.title}</h1>
                                ${data.thumbnail ? `<img src="${data.thumbnail.source}" class="mt-4 rounded-lg max-h-48 object-contain">` : ''}
                                <p class="mt-4 text-zinc-700 leading-relaxed text-sm">${data.extract}</p>
                                <a href="${data.content_urls.desktop.page}" target="_blank" class="text-blue-600 underline block mt-4 text-xs">Читать оригинал на новой вкладке →</a>
                            `;
                        } else {
                            body.innerHTML = "<p class='text-red-500'>Статья не найдена. Попробуйте другой запрос.</p>";
                        }
                    })
                    .catch(() => {
                        body.innerHTML = "<p class='text-red-500'>Ошибка сети при работе с API.</p>";
                    });
            });
        }
    },

    settings: {
        title: "Системные Настройки",
        width: 550, height: 400,
        bg: "bg-zinc-100 text-black p-5 flex flex-col",
        html: `
            <div class="flex-1 grid grid-cols-3 gap-4 text-center">
                <div class="p-3 bg-white rounded-xl shadow-sm border border-zinc-200 cursor-pointer hover:bg-zinc-50" id="set-bg-1">
                    <div class="h-16 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-lg mb-2"></div>
                    <span class="text-xs font-semibold">Neon Wave</span>
                </div>
                <div class="p-3 bg-white rounded-xl shadow-sm border border-zinc-200 cursor-pointer hover:bg-zinc-50" id="set-bg-2">
                    <div class="h-16 bg-gradient-to-tr from-blue-400 to-cyan-500 rounded-lg mb-2"></div>
                    <span class="text-xs font-semibold">Catalina Default</span>
                </div>
                <div class="p-3 bg-white rounded-xl shadow-sm border border-zinc-200 cursor-pointer hover:bg-zinc-50" id="set-bg-3">
                    <div class="h-16 bg-zinc-900 rounded-lg mb-2 flex items-center justify-center text-white text-xs">⬛</div>
                    <span class="text-xs font-semibold">Solid Dark</span>
                </div>
            </div>
            <div class="border-t pt-4 mt-4 text-xs text-zinc-500 space-y-1">
                <div><b>Имя компьютера:</b> MacOS Catalina</div>
                <div><b>Платформа хостинга:</b> Vercel Edge Network</div>
            </div>
        `,
        init(win) {
            const body = document.body;
            win.querySelector('#set-bg-1').addEventListener('click', () => {
                body.style.backgroundImage = "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')";
            });
            win.querySelector('#set-bg-2').addEventListener('click', () => {
                body.style.backgroundImage = "url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop')";
            });
            win.querySelector('#set-bg-3').addEventListener('click', () => {
                body.style.backgroundImage = "none";
                body.style.backgroundColor = "#121212";
            });
        }
    },

    calendar: {
        title: "Calendar",
        width: 400, height: 350,
        bg: "bg-zinc-50 text-black p-4",
        html: `
            <div class="text-center font-bold text-red-500 text-lg mb-4">Июнь 2026</div>
            <div class="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-zinc-400 mb-2">
                <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
            </div>
            <div class="grid grid-cols-7 gap-2 text-center text-sm" id="cal-days"></div>
        `,
        init(win) {
            const grid = win.querySelector('#cal-days');
            for(let i=1; i<=30; i++) {
                const day = document.createElement('div');
                day.className = `p-2 rounded ${i === 16 ? 'bg-red-500 text-white font-bold shadow-md' : 'hover:bg-zinc-200 text-zinc-800'}`;
                day.textContent = i;
                grid.appendChild(day);
            }
        }
    },

    photos: {
        title: "Photos",
        width: 500, height: 400,
        bg: "bg-zinc-900 text-white p-4 flex flex-col justify-between",
        html: `
            <div class="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 rounded-xl p-4" id="photo-dropzone">
                <span class="text-4xl mb-2">📸</span>
                <p class="text-xs text-zinc-400 text-center">Выберите картинку с вашего ПК для мгновенного просмотра</p>
                <input type="file" id="photo-input" accept="image/*" class="hidden">
                <button onclick="this.previousElementSibling.click()" class="mt-4 bg-blue-600 px-4 py-1.5 rounded-lg text-xs font-medium">Выбрать фото</button>
            </div>
            <img id="photo-view" class="hidden w-full h-full object-contain rounded-xl">
        `,
        init(win) {
            const input = win.querySelector('#photo-input');
            const zone = win.querySelector('#photo-dropzone');
            const img = win.querySelector('#photo-view');
            input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if(file) {
                    img.src = URL.createObjectURL(file);
                    zone.classList.add('hidden');
                    img.classList.remove('hidden');
                }
            });
        }
    },

    quicktime: {
        title: "QuickTime Player",
        width: 550, height: 380,
        bg: "bg-black flex flex-col justify-between p-2",
        html: `
            <div class="flex-1 flex flex-col items-center justify-center" id="qt-loader">
                <span class="text-4xl mb-2">🎬</span>
                <input type="file" id="qt-input" accept="video/*,audio/*" class="hidden">
                <button onclick="this.previousElementSibling.click()" class="bg-zinc-800 border border-zinc-700 px-4 py-2 rounded-lg text-xs">Загрузить медиафайл</button>
            </div>
            <video id="qt-video" controls class="hidden w-full h-full max-h-[320px]"></video>
        `,
        init(win) {
            const input = win.querySelector('#qt-input');
            const loader = win.querySelector('#qt-loader');
            const video = win.querySelector('#qt-video');
            input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if(file) {
                    video.src = URL.createObjectURL(file);
                    loader.classList.add('hidden');
                    video.classList.remove('hidden');
                    video.play();
                }
            });
        }
    },

    music: {
        title: "Music",
        width: 420, height: 280,
        bg: "bg-gradient-to-b from-zinc-800 to-zinc-950 p-4 flex flex-col justify-between",
        html: `
            <div class="text-center py-4">
                <div class="w-24 h-24 bg-red-500 rounded-2xl mx-auto shadow-xl flex items-center justify-center text-4xl">🎵</div>
                <h2 class="font-bold mt-3 text-sm truncate" id="track-title">Медиатека пуста</h2>
                <p class="text-xs text-zinc-400 mt-1">mACOS Audio Engine</p>
            </div>
            <input type="file" id="music-input" accept="audio/*" class="hidden">
            <audio id="music-core" class="w-full mt-2" controls></audio>
            <button onclick="this.previousElementSibling.previousElementSibling.click()" class="w-full bg-zinc-800/60 hover:bg-zinc-800 border border-white/5 py-2 rounded-lg text-xs font-medium">Добавить трек с ПК</button>
        `,
        init(win) {
            const input = win.querySelector('#music-input');
            const core = win.querySelector('#music-core');
            const title = win.querySelector('#track-title');
            input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if(file) {
                    core.src = URL.createObjectURL(file);
                    title.textContent = file.name;
                    core.play();
                }
            });
        }
    },

    tv: {
        title: "Kinogo TV Stream (The Movie DB API API Cloned Interface)",
        width: 800, height: 500,
        bg: "bg-[#141414] text-white flex flex-col",
        html: `
            <div class="bg-[#1f1f1f] p-3 border-b border-zinc-800 flex items-center justify-between">
                <div class="text-red-600 font-black tracking-wider text-lg">KINOGO SIM</div>
                <div class="text-xs text-zinc-400">Тренды кино (Генерация из глобального API)</div>
            </div>
            <div class="flex-1 p-6 overflow-y-auto grid grid-cols-3 gap-4" id="tv-trends-grid">
                <p class="text-xs text-zinc-500 animate-pulse col-span-3 text-center">Загрузка актуального кинопроката...</p>
            </div>
        `,
        init(win) {
            const grid = win.querySelector('#tv-trends-grid');
            // Используем публичный манифест трендов вместо iframe
            fetch('https://api.themoviedb.org/3/trending/movie/week?api_key=ca8b68847b43d2e3e961b7d069ec4d16&language=ru-RU')
                .then(res => res.json())
                .then(data => {
                    grid.innerHTML = '';
                    data.results.slice(0, 6).forEach(movie => {
                        const item = document.createElement('div');
                        item.className = "bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 cursor-pointer hover:scale-105 transition-all p-2";
                        item.innerHTML = `
                            <img src="https://image.tmdb.org/t/p/w500${movie.backdrop_path}" class="w-full h-28 object-cover rounded shadow">
                            <div class="p-2 text-xs font-bold truncate mt-1">${movie.title}</div>
                            <div class="px-2 text-[10px] text-zinc-500">⭐️ ${movie.vote_average.toFixed(1)}</div>
                        `;
                        item.onclick = () => alert(`Запуск стрима для фильма: ${movie.title}. (Потоковый буфер NW.js инициализирован)`);
                        grid.appendChild(item);
                    });
                })
                .catch(() => {
                    grid.innerHTML = "<p class='col-span-3 text-center text-xs text-zinc-600'>Не удалось получить список новинок кино. Проверьте соединение.</p>";
                });
        }
    },

    notes: {
        title: "Notes",
        width: 450, height: 320,
        bg: "bg-zinc-900 flex text-zinc-200",
        html: `
            <div class="w-1/3 bg-zinc-950 border-r border-zinc-800 p-2 text-xs space-y-1">
                <div class="bg-yellow-600/30 border border-yellow-600/50 p-2 rounded cursor-pointer">Заметка Vercel</div>
                <div class="p-2 hover:bg-zinc-800 rounded cursor-pointer">Планы на релиз</div>
            </div>
            <div class="flex-1 p-3 flex flex-col">
                <textarea class="w-full flex-1 bg-transparent border-none outline-none resize-none text-sm" placeholder="Начните писать тут...">macOS Catalina успешно кастомизирована под инди-сборку.</textarea>
            </div>
        `
    },

    notepad: {
        title: "Notepad++",
        width: 600, height: 420,
        bg: "bg-[#f8f9fa] text-black flex flex-col",
        html: `
            <div class="bg-zinc-100 border-b p-1.5 flex space-x-3 text-xs text-zinc-600 font-medium">
                <span class="cursor-pointer hover:text-black" id="note-save-btn">Сохранить как .txt</span>
            </div>
            <div class="flex-1 p-4">
                <textarea id="notepad-area" class="w-full h-full bg-transparent border-none outline-none font-mono text-sm resize-none" placeholder="Начните вводить текст..."></textarea>
            </div>
        `,
        init(win) {
            const area = win.querySelector('#notepad-area');
            const saveBtn = win.querySelector('#note-save-btn');
            
            saveBtn.addEventListener('click', () => {
                const text = area.value;
                const blob = new Blob([text], {type: "text/plain;charset=utf-8"});
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = "note.txt";
                link.click();
            });
        }
    }
};