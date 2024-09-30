<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple Search Engine with Collision</title>
    <style>
        body {
            margin: 0;
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            background-color: #f0f0f0;
            overflow: hidden;
            font-family: Arial, sans-serif;
        }

        .element {
            position: absolute;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 14px;
            color: white;
            font-weight: bold;
            cursor: grab;
            user-select: none;
        }

        .round {
            width: 80px;
            height: 80px;
            border-radius: 50%;
        }

        .square {
            width: 80px;
            height: 80px;
        }

        #search { background-color: #f44336; }
        #home { background-color: #4caf50; }
        #images { background-color: #009688; }
        #youtube { background-color: #e91e63; }

        .search-box {
            width: 250px;
            height: 40px;
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            align-items: center;
            padding: 5px;
            border: 1px solid #ccc;
            border-radius: 20px;
            background-color: white;
        }

        .search-box img {
            width: 30px;
            margin-right: 8px;
        }

        .search-input {
            width: 100%;
            border: none;
            outline: none;
            font-size: 14px;
        }

        .results {
            position: absolute;
            top: 80px; /* Below the search box */
            left: 50%;
            transform: translateX(-50%);
            width: 300px;
            max-height: 60vh;
            overflow-y: auto;
            background-color: white;
            border: 1px solid #ccc;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            display: none; /* Hidden by default */
        }

        .result-item {
            padding: 10px;
            cursor: pointer;
        }

        .result-item:hover {
            background-color: #f1f1f1;
        }
    </style>
</head>
<body>
    <div class="search-box" id="search-box">
        <img src="https://www.google.co.in/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png" alt="Google Logo">
        <input type="text" class="search-input" placeholder="Search Google" id="search-input">
    </div>

    <div class="results" id="results"></div>

    <div class="element round" id="search">Search</div>
    <div class="element square" id="home">Home</div>
    <div class="element round" id="images">Images</div>
    <div class="element square" id="youtube">YouTube</div>

    <script>
        const gravity = 0.4;
        const damping = 0.85;
        const dragFactor = 0.99;

        class Element {
            constructor(element) {
                this.element = element;
                this.x = Math.random() * (window.innerWidth - element.offsetWidth);
                this.y = Math.random() * (window.innerHeight - element.offsetHeight - 60);
                this.vx = Math.random() * 4 - 2;
                this.vy = Math.random() * 4 - 2;
                this.isDragging = false;

                this.element.style.left = `${this.x}px`;
                this.element.style.top = `${this.y}px`;
            }

            update(elements) {
                if (!this.isDragging) {
                    this.vy += gravity;
                    this.vx *= dragFactor;
                    this.vy *= dragFactor;

                    this.x += this.vx;
                    this.y += this.vy;

                    this.handleCollision(elements);
                }

                this.element.style.left = `${this.x}px`;
                this.element.style.top = `${this.y}px`;
            }

            handleCollision(elements) {
                // Wall collision
                if (this.x <= 0 || this.x + this.element.offsetWidth >= window.innerWidth) {
                    this.vx *= -damping;
                    this.x = this.x <= 0 ? 0 : window.innerWidth - this.element.offsetWidth;
                }

                if (this.y <= 0) {
                    this.vy *= -damping;
                    this.y = 0;
                } else if (this.y + this.element.offsetHeight >= window.innerHeight) {
                    this.vy *= -damping;
                    this.y = window.innerHeight - this.element.offsetHeight;
                }

                // Collision with other elements
                elements.forEach(otherElement => {
                    if (otherElement !== this) {
                        const rect1 = this.element.getBoundingClientRect();
                        const rect2 = otherElement.element.getBoundingClientRect();

                        if (this.isColliding(rect1, rect2)) {
                            this.vx *= -damping;
                            this.vy *= -damping;
                            this.x -= this.vx;
                            this.y -= this.vy;
                        }
                    }
                });
            }

            isColliding(rect1, rect2) {
                return !(rect1.right < rect2.left || 
                         rect1.left > rect2.right || 
                         rect1.bottom < rect2.top || 
                         rect1.top > rect2.bottom);
            }

            startDrag(mouseX, mouseY) {
                this.isDragging = true;
                this.dragOffsetX = mouseX - this.x;
                this.dragOffsetY = mouseY - this.y;
                this.vx = 0;
                this.vy = 0;
            }

            drag(mouseX, mouseY) {
                if (this.isDragging) {
                    this.x = mouseX - this.dragOffsetX;
                    this.y = mouseY - this.dragOffsetY;
                }
            }

            endDrag() {
                this.isDragging = false;
            }
        }

        const elements = [
            new Element(document.getElementById('search')),
            new Element(document.getElementById('home')),
            new Element(document.getElementById('images')),
            new Element(document.getElementById('youtube')),
            new Element(document.getElementById('search-box'))
        ];

        let activeElement = null;

        document.addEventListener('mousedown', (e) => {
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            elements.forEach(element => {
                const rect = element.element.getBoundingClientRect();
                if (mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom) {
                    activeElement = element;
                    element.startDrag(mouseX, mouseY);
                }
            });
        });

        document.addEventListener('mousemove', (e) => {
            if (activeElement) {
                activeElement.drag(e.clientX, e.clientY);
            }
        });

        document.addEventListener('mouseup', () => {
            if (activeElement) {
                activeElement.endDrag();
                activeElement = null;
            }
        });

        function animate() {
            elements.forEach(element => element.update(elements));
            requestAnimationFrame(animate);
        }

        animate();

        // Search functionality
        const results = document.getElementById('results');
        const searchInput = document.getElementById('search-input');

        const dummyData = [
            "Google Search",
            "Google Images",
            "YouTube Videos",
            "Google Maps",
            "Gmail Login",
            "Google Drive",
            "Google Docs",
            "Google Play Store",
            "Google News",
            "Google Scholar"
        ];

        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase();
            results.innerHTML = ''; // Clear previous results
            if (query) {
                const filteredResults = dummyData.filter(item => item.toLowerCase().includes(query));
                filteredResults.forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'result-item';
                    div.textContent = item;
                    div.onclick = () => alert(`You clicked on: ${item}`);
                    results.appendChild(div);
                });
                results.style.display = filteredResults.length > 0 ? 'block' : 'none';
            } else {
                results.style.display = 'none';
            }
        });
    </script>
</body>
</html>
