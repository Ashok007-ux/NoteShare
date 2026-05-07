        /* =====================================================================
                           BACKEND CONFIG
                           Replace these API_BASE calls with your real backend endpoints.
                           All functions are clearly marked for easy integration.
                           ===================================================================== */
        const API_BASE = '/api'; // Change this to your backend URL

        /* =====================================================================
           AUTH STATE
           ===================================================================== */
        let currentUser = null; // { id, name, email, token }

        /* ── Session persistence ── */
        function saveSession(user) {
            localStorage.setItem('sm_session', JSON.stringify(user));
        }

        function loadSession() {
            try {
                return JSON.parse(localStorage.getItem('sm_session'));
            } catch {
                return null;
            }
        }

        function clearSession() {
            localStorage.removeItem('sm_session');
        }

        /* =====================================================================
           AUTH PAGE SWITCHER
           ===================================================================== */
        function showPage(id) {
            document.querySelectorAll('.auth-page').forEach(p => p.classList.remove('active'));
            document.getElementById(id).classList.add('active');
            // clear alerts
            ['loginAlert', 'signupAlert', 'forgotAlert'].forEach(a => {
                const el = document.getElementById(a);
                el.className = 'auth-alert';
                el.textContent = '';
            });
        }

        function showAlert(id, msg, type = 'err') {
            const el = document.getElementById(id);
            el.className = `auth-alert ${type} on`;
            el.innerHTML = `<i class="fas fa-${type==='suc'?'check-circle':type==='inf'?'info-circle':'exclamation-circle'}"></i> ${msg}`;
        }

        /* =====================================================================
           PASSWORD VISIBILITY TOGGLE
           ===================================================================== */
        function toggleEye(inputId, btn) {
            const inp = document.getElementById(inputId);
            const isPass = inp.type === 'password';
            inp.type = isPass ? 'text' : 'password';
            btn.innerHTML = `<i class="fas fa-eye${isPass?'-slash':''}"></i>`;
        }

        /* =====================================================================
           PASSWORD STRENGTH
           ===================================================================== */
        function checkStrength(val) {
            const strength = document.getElementById('pwStrength');
            const hint = document.getElementById('pwHint');
            const bars = [document.getElementById('bar1'), document.getElementById('bar2'),
                document.getElementById('bar3'), document.getElementById('bar4')
            ];

            if (!val) {
                strength.classList.remove('on');
                return;
            }
            strength.classList.add('on');

            let score = 0;
            if (val.length >= 8) score++;
            if (val.length >= 12) score++;
            if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
            if (/[0-9]/.test(val) && /[^a-zA-Z0-9]/.test(val)) score++;

            const levels = ['weak', 'ok', 'ok', 'strong'];
            const labels = ['Too weak', 'Fair', 'Good', 'Strong'];
            const cls = score === 0 ? 'active-weak' : score < 3 ? 'active-ok' : 'active-strong';

            bars.forEach((b, i) => {
                b.className = 'pw-bar';
                if (i < score) b.classList.add(cls);
            });
            hint.textContent = score === 0 ? 'Too short' : labels[score - 1] || 'Strong';
            hint.style.color = score === 0 ? '#f06292' : score < 3 ? '#fbbf24' : '#4ade80';
        }

        /* =====================================================================
           VALIDATION HELPERS
           ===================================================================== */
        function isEmail(v) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        }

        function setErr(inputId, errId, msg) {
            document.getElementById(inputId).classList.add('err');
            const e = document.getElementById(errId);
            e.textContent = msg;
            e.classList.add('on');
        }

        function clearErr(inputId, errId) {
            document.getElementById(inputId).classList.remove('err');
            document.getElementById(errId).classList.remove('on');
        }

        function setLoading(btnId, on) {
            const btn = document.getElementById(btnId);
            btn.classList.toggle('loading', on);
            btn.disabled = on;
        }

        /* =====================================================================
           LOGIN HANDLER
           ─────────────────────────────────────────────────────────────────────
           BACKEND INTEGRATION:
           Replace the simulated fetch with a real POST to your login endpoint.
           Expected response: { success: true, user: { id, name, email }, token: "..." }
           On error:          { success: false, message: "Invalid credentials" }
           ===================================================================== */
        async function handleLogin() {
            const email = document.getElementById('loginEmail').value.trim();
            const pass = document.getElementById('loginPass').value;
            let valid = true;

            clearErr('loginEmail', 'loginEmailErr');
            clearErr('loginPass', 'loginPassErr');

            if (!isEmail(email)) {
                setErr('loginEmail', 'loginEmailErr', 'Please enter a valid email');
                valid = false;
            }
            if (!pass) {
                setErr('loginPass', 'loginPassErr', 'Password is required');
                valid = false;
            }
            if (!valid) return;

            setLoading('loginBtn', true);

            try {
                /* ── REPLACE THIS BLOCK WITH YOUR BACKEND CALL ──────────────────
                   const res = await fetch(`${API_BASE}/auth/login`, {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({ email, password: pass })
                   });
                   const data = await res.json();
                ────────────────────────────────────────────────────────────────── */

                // ── SIMULATED RESPONSE (remove when backend is ready) ──
                await delay(1200);
                const users = JSON.parse(localStorage.getItem('sm_users') || '[]');
                const found = users.find(u => u.email === email && u.password === pass);
                const data = found ? {
                    success: true,
                    user: {
                        id: found.id,
                        name: found.name,
                        email: found.email
                    },
                    token: 'demo_token_' + Date.now()
                } : {
                    success: false,
                    message: 'Incorrect email or password. Please try again.'
                };
                // ── END SIMULATION ──

                if (data.success) {
                    currentUser = {...data.user,
                        token: data.token
                    };
                    saveSession(currentUser);
                    enterApp();
                } else {
                    showAlert('loginAlert', data.message || 'Login failed');
                }
            } catch (e) {
                showAlert('loginAlert', 'Network error. Please try again.');
            } finally {
                setLoading('loginBtn', false);
            }
        }

        /* =====================================================================
           SIGNUP HANDLER
           ─────────────────────────────────────────────────────────────────────
           BACKEND INTEGRATION:
           Replace the simulated fetch with a real POST to your register endpoint.
           Expected response: { success: true, user: { id, name, email }, token: "..." }
           On error:          { success: false, message: "Email already registered" }
           ===================================================================== */
        async function handleSignup() {
            const name = document.getElementById('signupName').value.trim();
            const email = document.getElementById('signupEmail').value.trim();
            const pass = document.getElementById('signupPass').value;
            const pass2 = document.getElementById('signupPass2').value;
            let valid = true;

            ['signupName', 'signupEmail', 'signupPass', 'signupPass2'].forEach((id, i) => {
                clearErr(id, ['signupNameErr', 'signupEmailErr', 'signupPassErr', 'signupPass2Err'][i]);
            });

            if (!name) {
                setErr('signupName', 'signupNameErr', 'Please enter your full name');
                valid = false;
            }
            if (!isEmail(email)) {
                setErr('signupEmail', 'signupEmailErr', 'Please enter a valid email');
                valid = false;
            }
            if (pass.length < 8) {
                setErr('signupPass', 'signupPassErr', 'Password must be at least 8 characters');
                valid = false;
            }
            if (pass !== pass2) {
                setErr('signupPass2', 'signupPass2Err', 'Passwords do not match');
                valid = false;
            }
            if (!valid) return;

            setLoading('signupBtn', true);

            try {
                /* ── REPLACE THIS BLOCK WITH YOUR BACKEND CALL ──────────────────
                   const res = await fetch(`${API_BASE}/auth/register`, {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({ name, email, password: pass })
                   });
                   const data = await res.json();
                ────────────────────────────────────────────────────────────────── */

                // ── SIMULATED RESPONSE (remove when backend is ready) ──
                await delay(1400);
                const users = JSON.parse(localStorage.getItem('sm_users') || '[]');
                if (users.find(u => u.email === email)) {
                    var data = {
                        success: false,
                        message: 'This email is already registered. Please sign in.'
                    };
                } else {
                    const newUser = {
                        id: 'u_' + Date.now(),
                        name,
                        email,
                        password: pass
                    };
                    users.push(newUser);
                    localStorage.setItem('sm_users', JSON.stringify(users));
                    var data = {
                        success: true,
                        user: {
                            id: newUser.id,
                            name,
                            email
                        },
                        token: 'demo_token_' + Date.now()
                    };
                }
                // ── END SIMULATION ──

                if (data.success) {
                    currentUser = {...data.user,
                        token: data.token
                    };
                    saveSession(currentUser);
                    showAlert('signupAlert', 'Account created! Welcome to ShareMind 🎉', 'suc');
                    await delay(1000);
                    enterApp();
                } else {
                    showAlert('signupAlert', data.message || 'Signup failed');
                }
            } catch (e) {
                showAlert('signupAlert', 'Network error. Please try again.');
            } finally {
                setLoading('signupBtn', false);
            }
        }

        /* =====================================================================
           FORGOT PASSWORD HANDLER
           ─────────────────────────────────────────────────────────────────────
           BACKEND INTEGRATION:
           Replace the simulated fetch with a real POST to your reset endpoint.
           Expected response: { success: true }
           On error:          { success: false, message: "Email not found" }
           ===================================================================== */
        async function handleForgot() {
            const email = document.getElementById('forgotEmail').value.trim();
            clearErr('forgotEmail', 'forgotEmailErr');

            if (!isEmail(email)) {
                setErr('forgotEmail', 'forgotEmailErr', 'Please enter a valid email');
                return;
            }

            setLoading('forgotBtn', true);

            try {
                /* ── REPLACE THIS BLOCK WITH YOUR BACKEND CALL ──────────────────
                   const res = await fetch(`${API_BASE}/auth/forgot-password`, {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({ email })
                   });
                   const data = await res.json();
                ────────────────────────────────────────────────────────────────── */

                // ── SIMULATED RESPONSE (remove when backend is ready) ──
                await delay(1200);
                const users = JSON.parse(localStorage.getItem('sm_users') || '[]');
                const data = users.find(u => u.email === email) ? {
                    success: true
                } : {
                    success: false,
                    message: 'No account found with this email address.'
                };
                // ── END SIMULATION ──

                if (data.success) {
                    document.getElementById('forgotEmailGroup').style.display = 'none';
                    document.getElementById('forgotBtn').style.display = 'none';
                    showAlert('forgotAlert', `Reset link sent to ${email}. Check your inbox.`, 'suc');
                } else {
                    showAlert('forgotAlert', data.message || 'Something went wrong.');
                }
            } catch (e) {
                showAlert('forgotAlert', 'Network error. Please try again.');
            } finally {
                setLoading('forgotBtn', false);
            }
        }

        /* =====================================================================
           SESSION MANAGEMENT
           ===================================================================== */
        function enterApp() {
            document.getElementById('authWrap').classList.add('hidden');
            document.getElementById('appWrap').classList.add('visible');
            // Update user UI
            document.getElementById('userNameEl').textContent = currentUser.name;
            document.getElementById('userEmailEl').textContent = currentUser.email;
            document.getElementById('userAvatar').textContent = currentUser.name.charAt(0).toUpperCase();
            // Init app
            initApp();
        }

        function handleLogout() {
            clearSession();
            currentUser = null;
            notes = [];
            document.getElementById('appWrap').classList.remove('visible');
            document.getElementById('authWrap').classList.remove('hidden');
            showPage('pageLogin');
            toast('Signed out successfully', 'inf');
        }

        /* =====================================================================
           KEYBOARD SHORTCUTS (Enter to submit)
           ===================================================================== */
        document.getElementById('loginEmail').addEventListener('keydown', e => {
            if (e.key === 'Enter') document.getElementById('loginPass').focus();
        });
        document.getElementById('loginPass').addEventListener('keydown', e => {
            if (e.key === 'Enter') handleLogin();
        });
        document.getElementById('signupName').addEventListener('keydown', e => {
            if (e.key === 'Enter') document.getElementById('signupEmail').focus();
        });
        document.getElementById('signupEmail').addEventListener('keydown', e => {
            if (e.key === 'Enter') document.getElementById('signupPass').focus();
        });
        document.getElementById('signupPass').addEventListener('keydown', e => {
            if (e.key === 'Enter') document.getElementById('signupPass2').focus();
        });
        document.getElementById('signupPass2').addEventListener('keydown', e => {
            if (e.key === 'Enter') handleSignup();
        });
        document.getElementById('forgotEmail').addEventListener('keydown', e => {
            if (e.key === 'Enter') handleForgot();
        });

        /* =====================================================================
           ANIMATED BACKGROUND (Auth)
           ===================================================================== */
        (function() {
            const canvas = document.getElementById('bgCanvas2');
            const ctx = canvas.getContext('2d');
            const ORBS = [{
                x: .15,
                y: .2,
                r: 380,
                c: '#7c6ff7',
                vx: .00015,
                vy: .0001
            }, {
                x: .85,
                y: .75,
                r: 320,
                c: '#f06292',
                vx: -.0002,
                vy: -.00015
            }, {
                x: .5,
                y: .5,
                r: 260,
                c: '#2dd4bf',
                vx: .0001,
                vy: .0002
            }, {
                x: .3,
                y: .8,
                r: 200,
                c: '#fbbf24',
                vx: .00018,
                vy: -.0001
            }, ];
            let t = 0,
                W, H;

            function resize() {
                W = canvas.width = window.innerWidth;
                H = canvas.height = window.innerHeight;
            }
            window.addEventListener('resize', resize);
            resize();

            function draw() {
                t++;
                ctx.clearRect(0, 0, W, H);
                ORBS.forEach((o, i) => {
                    const ox = (o.x + Math.sin(t * o.vx + i) * .12) * W;
                    const oy = (o.y + Math.cos(t * o.vy + i) * .1) * H;
                    const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, o.r);
                    g.addColorStop(0, o.c + '44');
                    g.addColorStop(1, 'transparent');
                    ctx.fillStyle = g;
                    ctx.fillRect(0, 0, W, H);
                });
                requestAnimationFrame(draw);
            }
            draw();
        })();

        /* =====================================================================
           NOTES APP
           ===================================================================== */
        const SK = 'sm_notes_v3',
            TK = 'sm_theme';
        const COLS = {
            violet: '#7c6ff7',
            rose: '#f06292',
            amber: '#fbbf24',
            teal: '#2dd4bf',
            sky: '#38bdf8'
        };
        const TICONS = {
            work: 'fa-briefcase',
            personal: 'fa-user',
            ideas: 'fa-lightbulb',
            reminders: 'fa-bell'
        };
        const TAG_LABELS = {
            all: 'All Notes',
            work: 'Work',
            personal: 'Personal',
            ideas: 'Ideas',
            reminders: 'Reminders'
        };

        let notes = [],
            filter = 'all',
            sortBy = 'new',
            query = '',
            selColor = 'violet',
            delId = null,
            isDark = true;

        function notesKey() {
            return SK + '_' + (currentUser ? currentUser.id : 'guest');
        }

        function loadNotes() {
            try {
                notes = JSON.parse(localStorage.getItem(notesKey()) || '[]');
            } catch {
                notes = [];
            }
        }

        function saveNotes() {
            localStorage.setItem(notesKey(), JSON.stringify(notes));
        }

        /* Animated background (App) */
        (function() {
            const canvas = document.getElementById('bgCanvas');
            const ctx = canvas.getContext('2d');
            const ORBS = [{
                x: .15,
                y: .2,
                r: 380,
                c: '#7c6ff7',
                vx: .00015,
                vy: .0001
            }, {
                x: .85,
                y: .75,
                r: 320,
                c: '#f06292',
                vx: -.0002,
                vy: -.00015
            }, {
                x: .5,
                y: .5,
                r: 260,
                c: '#2dd4bf',
                vx: .0001,
                vy: .0002
            }, {
                x: .3,
                y: .8,
                r: 200,
                c: '#fbbf24',
                vx: .00018,
                vy: -.0001
            }, ];
            let t = 0,
                W, H;

            function resize() {
                W = canvas.width = window.innerWidth;
                H = canvas.height = window.innerHeight;
            }
            window.addEventListener('resize', resize);
            resize();

            function draw() {
                t++;
                ctx.clearRect(0, 0, W, H);
                ORBS.forEach((o, i) => {
                    const ox = (o.x + Math.sin(t * o.vx + i) * .12) * W;
                    const oy = (o.y + Math.cos(t * o.vy + i) * .1) * H;
                    const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, o.r);
                    g.addColorStop(0, o.c + '44');
                    g.addColorStop(1, 'transparent');
                    ctx.fillStyle = g;
                    ctx.fillRect(0, 0, W, H);
                });
                requestAnimationFrame(draw);
            }
            draw();
        })();

        /* Theme */
        function applyTheme() {
            document.body.classList.toggle('light', !isDark);
            const tb = document.querySelector('.topbar');
            if (tb) tb.style.background = isDark ? 'rgba(10,10,18,.8)' : 'rgba(246,245,242,.8)';
            document.getElementById('thIco').className = `fas fa-${isDark?'moon':'sun'}`;
            document.getElementById('thTxt').textContent = isDark ? 'Dark Mode' : 'Light Mode';
            localStorage.setItem(TK, isDark ? 'dark' : 'light');
        }

        function initTheme() {
            isDark = localStorage.getItem(TK) !== 'light';
            applyTheme();
        }
        document.getElementById('themeBtnSb').addEventListener('click', () => {
            isDark = !isDark;
            applyTheme();
        });

        /* Sidebar */
        const sidebar = document.getElementById('sidebar'),
            veil = document.getElementById('veil');

        function openSb() {
            sidebar.classList.add('open');
            veil.classList.add('on');
        }

        function closeSb() {
            sidebar.classList.remove('open');
            veil.classList.remove('on');
        }
        document.getElementById('hamBtn').addEventListener('click', openSb);
        document.getElementById('sbClose').addEventListener('click', closeSb);
        veil.addEventListener('click', closeSb);

        /* Nav filter */
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                filter = btn.dataset.f;
                updateHeading();
                render();
                if (window.innerWidth < 768) closeSb();
            });
        });

        /* Search */
        const searchInp = document.getElementById('searchInp'),
            clrBtn = document.getElementById('clrBtn');
        searchInp.addEventListener('input', () => {
            query = searchInp.value.trim().toLowerCase();
            clrBtn.classList.toggle('on', query.length > 0);
            render();
        });
        clrBtn.addEventListener('click', () => {
            searchInp.value = '';
            query = '';
            clrBtn.classList.remove('on');
            render();
            searchInp.focus();
        });

        /* Sort */
        document.getElementById('sortSel').addEventListener('change', e => {
            sortBy = e.target.value;
            render();
        });

        /* Swatches */
        document.querySelectorAll('.swatch').forEach(s => {
            s.addEventListener('click', () => {
                document.querySelectorAll('.swatch').forEach(x => x.classList.remove('on'));
                s.classList.add('on');
                selColor = s.dataset.c;
            });
        });

        /* Modal */
        const overlay = document.getElementById('overlay');
        const mTitle = document.getElementById('mTitle'),
            mSave = document.getElementById('mSave');
        const editIdEl = document.getElementById('editId'),
            fTitle = document.getElementById('fTitle');
        const fBody = document.getElementById('fBody'),
            fTag = document.getElementById('fTag');
        const fRemind = document.getElementById('fRemind'),
            eTitle = document.getElementById('eTitle'),
            eBody = document.getElementById('eBody');

        function openModal(note = null) {
            document.getElementById('noteForm').reset();
            eTitle.classList.remove('on');
            eBody.classList.remove('on');
            fTitle.classList.remove('err');
            fBody.classList.remove('err');
            document.querySelectorAll('.swatch').forEach((s, i) => s.classList.toggle('on', i === 0));
            selColor = 'violet';
            if (note) {
                mTitle.textContent = 'Edit Note';
                mSave.innerHTML = '<i class="fas fa-check"></i> Update Note';
                editIdEl.value = note.id;
                fTitle.value = note.title;
                fBody.value = note.content;
                fTag.value = note.tag;
                fRemind.value = note.reminder || '';
                const sw = document.querySelector(`.swatch[data-c="${note.color||'violet'}"]`);
                if (sw) {
                    document.querySelectorAll('.swatch').forEach(x => x.classList.remove('on'));
                    sw.classList.add('on');
                    selColor = note.color || 'violet';
                }
            } else {
                mTitle.textContent = 'New Note';
                mSave.innerHTML = '<i class="fas fa-check"></i> Save Note';
                editIdEl.value = '';
            }
            overlay.classList.add('on');
            setTimeout(() => fTitle.focus(), 120);
        }

        function closeModal() {
            overlay.classList.remove('on');
        }

        document.getElementById('addBtn').addEventListener('click', () => openModal());
        document.getElementById('emptyCta').addEventListener('click', () => openModal());
        document.getElementById('mClose').addEventListener('click', closeModal);
        document.getElementById('mCancel').addEventListener('click', closeModal);
        overlay.addEventListener('click', e => {
            if (e.target === overlay) closeModal();
        });

        document.getElementById('noteForm').addEventListener('submit', e => {
            e.preventDefault();
            const t = fTitle.value.trim(),
                b = fBody.value.trim();
            let ok = true;
            if (!t) {
                eTitle.classList.add('on');
                fTitle.classList.add('err');
                ok = false;
            } else {
                eTitle.classList.remove('on');
                fTitle.classList.remove('err');
            }
            if (!b) {
                eBody.classList.add('on');
                fBody.classList.add('err');
                ok = false;
            } else {
                eBody.classList.remove('on');
                fBody.classList.remove('err');
            }
            if (!ok) return;
            const eid = editIdEl.value;
            if (eid) {
                const idx = notes.findIndex(n => n.id === eid);
                if (idx !== -1) {
                    notes[idx] = {...notes[idx],
                        title: t,
                        content: b,
                        tag: fTag.value,
                        reminder: fRemind.value,
                        color: selColor,
                        updAt: Date.now()
                    };
                    toast('Note updated!', 'suc');
                }
            } else {
                notes.unshift({
                    id: uid(),
                    title: t,
                    content: b,
                    tag: fTag.value,
                    reminder: fRemind.value,
                    color: selColor,
                    pinned: false,
                    crAt: Date.now(),
                    updAt: Date.now()
                });
                toast('Note saved!', 'suc');
            }
            saveNotes();
            closeModal();
            render();
        });

        /* Confirm delete */
        const confOverlay = document.getElementById('confOverlay');

        function openConfirm(id) {
            delId = id;
            confOverlay.classList.add('on');
        }

        function closeConfirm() {
            delId = null;
            confOverlay.classList.remove('on');
        }
        document.getElementById('confNo').addEventListener('click', closeConfirm);
        confOverlay.addEventListener('click', e => {
            if (e.target === confOverlay) closeConfirm();
        });
        document.getElementById('confYes').addEventListener('click', () => {
            if (!delId) return;
            const card = document.querySelector(`.card[data-id="${delId}"]`);

            function removeIt() {
                notes = notes.filter(n => n.id !== delId);
                saveNotes();
                closeConfirm();
                render();
                toast('Note deleted', 'err');
            }
            if (card) {
                card.classList.add('leaving');
                card.addEventListener('animationend', removeIt, {
                    once: true
                });
            } else removeIt();
        });

        function togglePin(id) {
            const n = notes.find(n => n.id === id);
            if (!n) return;
            n.pinned = !n.pinned;
            saveNotes();
            render();
            toast(n.pinned ? 'Note pinned!' : 'Unpinned', 'inf');
        }

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                closeModal();
                closeConfirm();
            }
        });

        function toast(msg, type = 'inf') {
            const ico = type === 'suc' ? 'fa-check-circle' : type === 'err' ? 'fa-times-circle' : 'fa-info-circle';
            const el = document.createElement('div');
            el.className = `toast ${type}`;
            el.innerHTML = `<i class="fas ${ico} t-ico"></i>${esc(msg)}`;
            document.getElementById('toasts').appendChild(el);
            setTimeout(() => {
                el.classList.add('out');
                el.addEventListener('animationend', () => el.remove(), {
                    once: true
                });
            }, 3000);
        }

        function getList() {
            let list = [...notes];
            if (filter !== 'all') list = list.filter(n => n.tag === filter);
            if (query) list = list.filter(n => n.title.toLowerCase().includes(query) || n.content.toLowerCase().includes(query));
            list.sort((a, b) => {
                if (b.pinned !== a.pinned) return b.pinned - a.pinned;
                if (sortBy === 'new') return b.crAt - a.crAt;
                if (sortBy === 'old') return a.crAt - b.crAt;
                if (sortBy === 'az') return a.title.localeCompare(b.title);
                return 0;
            });
            return list;
        }

        function updateCounts() {
            document.getElementById('c-all').textContent = notes.length;
            document.getElementById('c-work').textContent = notes.filter(n => n.tag === 'work').length;
            document.getElementById('c-personal').textContent = notes.filter(n => n.tag === 'personal').length;
            document.getElementById('c-ideas').textContent = notes.filter(n => n.tag === 'ideas').length;
            document.getElementById('c-reminders').textContent = notes.filter(n => n.tag === 'reminders').length;
        }

        function updateHeading() {
            document.getElementById('pgTitle').textContent = TAG_LABELS[filter] || 'Notes';
        }

        function renderStats() {
            const pinned = notes.filter(n => n.pinned).length,
                rems = notes.filter(n => n.reminder).length;
            document.getElementById('statsRow').innerHTML = `
    <div class="stat-chip s-tot"><i class="fas fa-file-alt"></i> <b>${notes.length}</b> total</div>
    ${pinned?`<div class="stat-chip s-pin"><i class="fas fa-thumbtack"></i> <b>${pinned}</b> pinned</div>`:''}
    ${rems?`<div class="stat-chip s-rem"><i class="fas fa-bell"></i> <b>${rems}</b> with reminder</div>`:''}
  `;
}

function makeCard(note,i){
  const card=document.createElement('div');
  card.className='card'+(note.pinned?' pinned':'');
  card.dataset.id=note.id;
  card.style.animationDelay=`${i*.045}s`;
  card.style.setProperty('--c-accent',COLS[note.color||'violet']);
  let remHtml='';
  if(note.reminder){
    const rd=new Date(note.reminder),over=rd<new Date();
    remHtml=`<div class="c-remind ${over?'over':''}"><i class="fas fa-bell"></i>${fmtRemind(note.reminder)}${over?'<span style="margin-left:auto;font-size:.62rem;opacity:.8">Overdue</span>':''}</div>`;
  }
  card.innerHTML=`
    <div class="c-top">
      <span class="tag-badge ${note.tag}"><i class="fas ${TICONS[note.tag]||'fa-tag'}"></i> ${note.tag}</span>
      <span class="pin-flag" title="Pinned"><i class="fas fa-thumbtack"></i></span>
    </div>
    <div class="c-title">${esc(note.title)}</div>
    ${remHtml}
    <div class="c-body">${esc(note.content)}</div>
    <div class="c-foot">
      <span class="c-date"><i class="fas fa-clock"></i> ${fmtDate(note.crAt)}</span>
      <div class="c-actions">
        <button class="act-btn a-pin ${note.pinned?'on':''}" title="${note.pinned?'Unpin':'Pin'}"><i class="fas fa-thumbtack"></i></button>
        <button class="act-btn a-edit" title="Edit"><i class="fas fa-pen"></i></button>
        <button class="act-btn a-del" title="Delete"><i class="fas fa-trash"></i></button>
      </div>
    </div>`;
  card.querySelector('.a-pin').addEventListener('click',e=>{ e.stopPropagation(); togglePin(note.id); });
  card.querySelector('.a-edit').addEventListener('click',e=>{ e.stopPropagation(); openModal(note); });
  card.querySelector('.a-del').addEventListener('click',e=>{ e.stopPropagation(); openConfirm(note.id); });
  return card;
}

function render(){
  const list=getList(),grid=document.getElementById('grid'),empty=document.getElementById('emptyEl');
  grid.innerHTML=''; empty.classList.toggle('on',list.length===0);
  list.forEach((n,i)=>grid.appendChild(makeCard(n,i)));
  const cnt=list.length;
  document.getElementById('pgCount').textContent=`${cnt} note${cnt!==1?'s':''}${filter!=='all'?' in '+filter:''}${query?' · "'+query+'"':''}`;
  updateCounts(); renderStats();
}

function uid(){ return `${Date.now()}_${Math.random().toString(36).slice(2,6)}`; }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function fmtDate(ts){ return new Date(ts).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}); }
function fmtRemind(s){ const d=new Date(s); return d.toLocaleDateString('en-US',{month:'short',day:'numeric'})+' at '+d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'}); }
function delay(ms){ return new Promise(r=>setTimeout(r,ms)); }

function seed(){
  if(notes.length>0) return;
  const now=Date.now();
  notes=[
    {id:uid(),title:'Welcome to ShareMind ✦',content:'Your professional thought space. Notes save automatically and persist across sessions. Pin notes, set reminders, filter by tag, and switch themes.',tag:'ideas',color:'violet',pinned:true,reminder:'',crAt:now,updAt:now},
    {id:uid(),title:'Q2 Product Strategy',content:'Finalize roadmap priorities. Sync with design on the new onboarding flow and check engineering timeline for API rollout before sprint planning.',tag:'work',color:'sky',pinned:false,reminder:'',crAt:now-86400000,updAt:now-86400000},
    {id:uid(),title:'Reading List',content:'The Almanack of Naval Ravikant, Meditations by Marcus Aurelius, Deep Work by Cal Newport, and Designing Data-Intensive Applications.',tag:'personal',color:'rose',pinned:false,reminder:'',crAt:now-172800000,updAt:now-172800000},
    {id:uid(),title:'App Idea — Focus Timer',content:'Build a minimal pomodoro app with ambient sounds, streak tracking, and weekly reports. No sign-up required. Ship an MVP in a weekend.',tag:'ideas',color:'teal',pinned:false,reminder:'',crAt:now-259200000,updAt:now-259200000},
  ];
  saveNotes();
}

function initApp(){
  initTheme();
  loadNotes();
  seed();
  updateHeading();
  render();
}

/* ── Auto-login if session exists ── */
(function(){
  const session=loadSession();
  if(session && session.token){
    currentUser=session;
    enterApp();
  }
})();