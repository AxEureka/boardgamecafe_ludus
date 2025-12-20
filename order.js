// --- order.js 完成版（固定ポップアップサイズ・いただきますボタン・推薦ゲーム組み込み・アイコンバウンド＋吹き出し・CSSキーフレーム対応） ---

// JSON 見開きデータ
const pagesData = [
    "data/drink.json",
    "data/food.json?v=2",
    "data/dessert.json?v=2"
];

let currentSpread = 0;
const book = document.querySelector(".book");
let leftPage, rightPage;

// --- Utility: JSONカテゴリ判定 ---
function getCategoryIcon(jsonPath) {
    if (!jsonPath) return null;
    if (jsonPath.includes("drink")) return "images/order/drip.png";
    if (jsonPath.includes("food")) return "images/order/pan.png";
    if (jsonPath.includes("dessert")) return "images/order/bowl.png";
    return null;
}

// --- Elements ---
const popup = document.getElementById("popup");
const popupImg = document.getElementById("popup-img");
const popupName = document.getElementById("popup-name");
const popupText = document.getElementById("popup-text");
const popupClose = document.getElementById("popup-close");
const orderBtn = document.getElementById("order-btn");
const bubble = document.getElementById("popup-bubble");

// Random master messages
const messages = [
    "承りました",
    "少々お待ちください",
    "かしこまりました"
];

// Current item memory
let currentItem = null;
let currentJsonPath = null;

// --- ページ生成（左右2ページ、片ページ4枠） ---
function createSpread() {
    leftPage = document.createElement("div");
    leftPage.className = "page left";
    rightPage = document.createElement("div");
    rightPage.className = "page right";

    for (let i = 0; i < 4; i++) {
        [leftPage, rightPage].forEach(page => {
            const itemDiv = document.createElement("div");
            itemDiv.className = "menu-item";

            const imgDiv = document.createElement("div");
            const h3 = document.createElement("h3");

            itemDiv.appendChild(imgDiv);
            itemDiv.appendChild(h3);
            page.appendChild(itemDiv);
        });
    }

    book.appendChild(leftPage);
    book.appendChild(rightPage);
}

// --- 見開き読み込み ---
function loadSpread(index) {
    const leftItems = leftPage.querySelectorAll(".menu-item");
    const rightItems = rightPage.querySelectorAll(".menu-item");

    fetch(pagesData[index])
        .then(res => res.json())
        .then(data => {
            for (let i = 0; i < 8; i++) {
                const item = data[i];
                const target = i < 4 ? leftItems[i] : rightItems[i - 4];
                const imgDiv = target.querySelector("div");
                const h3 = target.querySelector("h3");

                if (item) {
                    imgDiv.style.backgroundImage = item.image ? `url(${item.image})` : "none";
                    imgDiv.style.cursor = item.image ? "pointer" : "default";
                    imgDiv.onclick = item.image ? () => showPopup(item, pagesData[index]) : null;
                    h3.textContent = item.title;
                } else {
                    imgDiv.style.backgroundImage = "none";
                    imgDiv.style.cursor = "default";
                    h3.textContent = "";
                }
            }
        });

    document.getElementById("prev-page").style.display = index === 0 ? "none" : "block";
    document.getElementById("next-page").style.display = index === pagesData.length - 1 ? "none" : "block";

    leftPage.classList.remove("flipped");
    rightPage.classList.remove("flipped");
    leftPage.style.zIndex = 2;
    rightPage.style.zIndex = 3;
}

// --- ページめくり ---
function turnPage(next = true) {
    if (next) {
        // 次ページめくり時のみアニメ
        rightPage.style.zIndex = 10;
        rightPage.classList.add("flipped");

        setTimeout(() => {
            currentSpread += 1;
            loadSpread(currentSpread);
            rightPage.classList.remove("flipped"); // クラスをリセット
        });
    } else {
        // 前ページに戻る時はアニメなし＆z-index変更なし
        currentSpread -= 1;
        loadSpread(currentSpread);
    }
}

document.getElementById("next-page").onclick = () => {
    if (currentSpread < pagesData.length - 1) turnPage(true);
};
document.getElementById("prev-page").onclick = () => {
    if (currentSpread > 0) turnPage(false);
};

// --- ポップアップ表示 ---
function showPopup(item, jsonPath) {
    currentItem = item;
    currentJsonPath = jsonPath;

    popup.style.display = "flex";
    popupName.textContent = item.title;
    popupText.textContent = item.desc || "";
    popupImg.src = item.image || "";
    popupImg.style.display = item.image ? "block" : "none";
    
    orderBtn.textContent = "注文する";
    orderBtn.style.display = "block";

    // 推薦用要素リセット
    const existingText = document.getElementById("recommend-popup-text");
    if(existingText) existingText.remove();
    const existingCard = document.getElementById("recommend-game-container");
    if(existingCard) existingCard.remove();
}

// --- ポップアップ閉じる ---
popupClose.addEventListener("click", () => popup.style.display = "none");
popup.addEventListener("click", e => {
    if (e.target === popup) popup.style.display = "none";
});

orderBtn.addEventListener("click", () => {
    if (!currentItem) return;

    // 「注文する」ボタンの場合
    if (orderBtn.textContent === "注文する") {
        bubble.textContent = messages[Math.floor(Math.random() * messages.length)];
        bubble.classList.add("show");

        setTimeout(() => {
            bubble.classList.remove("show");
            popupName.textContent = "";
            popupText.textContent = "";
            orderBtn.style.display = "none";

            setTimeout(() => {
                const icon = getCategoryIcon(currentJsonPath);
                if (icon) {
                    popupImg.src = icon;
                    popupImg.style.display = "block";
                    popupImg.style.width = "500px";
                    popupImg.style.height = "500px";
                    popupImg.style.objectFit = "contain";
                    popupImg.parentElement.style.display = "flex";
                    popupImg.parentElement.style.justifyContent = "center";
                    popupImg.parentElement.style.alignItems = "center";

                    popupImg.classList.add("popup-icon-bounce");

                    const positions = [
                        [{ top: "10%", left: "5%" }, { top: "40%", left: "65%" }],
                        [{ top: "10%", left: "65%" }, { top: "40%", left: "5%" }]
                    ];
                    const pattern = positions[Math.floor(Math.random() * positions.length)];

                    [2000, 4000].forEach((delay, i) => {
                        setTimeout(() => {
                            const floatMsgs = ["早くできないかな","味見していい？","これおいしいよね","お手伝いある？","つまみ食いはダメ！","もうすぐできるよ"];
                            const msg = floatMsgs[Math.floor(Math.random() * floatMsgs.length)];

                            let floatBubble = document.createElement("div");
                            floatBubble.className = "popup-float-bubble";
                            floatBubble.textContent = msg;

                            floatBubble.style.position = "absolute";
                            floatBubble.style.top = pattern[i].top;
                            floatBubble.style.left = pattern[i].left;
                            floatBubble.style.fontSize = "22px";
                            floatBubble.style.fontWeight = "bold";
                            floatBubble.style.color = "#3a2a14";
                            floatBubble.style.padding = "12px 28px";
                            floatBubble.style.borderRadius = "20px";
　　　　　　　　　　　　　// 色の候補
　　　　　　　　　　　　　const colors = [
                            "rgba(255, 200, 200, 0.8)", // 淡い赤
                            "rgba(200, 200, 255, 0.8)", // 淡い青
                            "rgba(255, 255, 200, 0.8)", // 淡い黄
                            "rgba(200, 255, 200, 0.8)", // 淡い緑
                            "rgba(230, 200, 255, 0.8)", // 淡い紫
                            "rgba(255, 220, 180, 0.8)", // 淡いオレンジ
                            "rgba(255, 255, 255, 0.9)"  // 白
                            ];

　　　　　　　　　　　　 // ランダム選択
　　　　　　　　　　　　 floatBubble.style.background = colors[Math.floor(Math.random() * colors.length)];

                            floatBubble.style.boxShadow = "2px 2px 8px rgba(0,0,0,0.3)";

                            popup.querySelector(".popup-content").appendChild(floatBubble);

                            floatBubble.addEventListener("animationend", () => {
                                floatBubble.remove();
                            });
                        }, delay);
                    });
                }

              // --- 5秒後に元のメニュー復帰 ---
setTimeout(() => {
    const floatBubbles = popup.querySelectorAll(".popup-float-bubble");
    floatBubbles.forEach(b => b.remove());

    popupImg.src = currentItem.image || "";
    popupImg.style.width = "";
    popupImg.style.height = "";
    popupImg.style.objectFit = "";
    popupImg.parentElement.style.display = "";
    popupImg.classList.remove("popup-icon-bounce");

    // --- ここから表示順入れ替え ---
    const inner = document.querySelector(".popup-inner");
    inner.appendChild(popupText);      // 1行目「どうぞ召し上がれ」
    inner.appendChild(popupName);      // 2行目タイトル
    inner.appendChild(document.getElementById("popup-afterline")); // 3行目 afterLine
    // --- 入れ替えここまで ---

    // テキスト内容セット
    popupText.textContent = "どうぞ召し上がれ";
    popupName.textContent = currentItem.title;
    const afterlineEl = document.getElementById("popup-afterline");
    afterlineEl.textContent = currentItem.afterLine || "";

    // ボタン再表示
    orderBtn.textContent = "いただきます";
    orderBtn.style.display = "block";

}, 5000);


            }, 400);
        }, 2000);

    } 
    // 「いただきます」ボタンの場合
    else if (orderBtn.textContent === "いただきます") {
        orderBtn.style.display = "none";

        popupImg.style.transition = "opacity 2s ease";
        popupImg.style.opacity = 0;

        setTimeout(() => {
            popupName.textContent = "";
            popupText.textContent = "";

            document.getElementById("popup-afterline").textContent = "";

            const messages2 = ["これで遊ばない？","これもおすすめ！","一緒に遊ぼうよ！","これ、やってみない？"];
            const bubbleText = messages2[Math.floor(Math.random() * messages2.length)];

            let topText = document.getElementById("recommend-popup-text");
            if(!topText){
                topText = document.createElement("div");
                topText.id = "recommend-popup-text";
                topText.style.position = "absolute";
                topText.style.top = "30px";
                topText.style.left = "50%";
                topText.style.transform = "translateX(-50%)";
                topText.style.fontSize = "36px";
                topText.style.fontWeight = "bold";
                topText.style.color = "#3a2a14";
                topText.style.textAlign = "center";
                popup.querySelector(".popup-content").appendChild(topText);
            }
            topText.textContent = bubbleText;

            let recommendDiv = document.getElementById("recommend-game-container");
            if(!recommendDiv){
                recommendDiv = document.createElement("div");
                recommendDiv.id = "recommend-game-container";
                recommendDiv.style.position = "absolute";
                recommendDiv.style.bottom = "30px";
                recommendDiv.style.left = "50%";
                recommendDiv.style.transform = "translateX(-50%)";
                popup.querySelector(".popup-content").appendChild(recommendDiv);
            }
            recommendDiv.innerHTML = "";

            if(currentItem.recommendGame){
                fetch("data/games.json")
                    .then(res => res.json())
                    .then(games => {
                        const g = games.find(game => game.title === currentItem.recommendGame);
                        if(g){
                            const card = document.createElement("div");
                            card.className = "game-card";
                            card.innerHTML = `
                                <a href="detail.html?title=${encodeURIComponent(g.title)}">
                                    <img src="${g.images?.[0] || g.image || 'images/no_image.png'}" 
                                         alt="${g.title}">
                                    <p class="game-desc">${g.desc || ""}</p>
                                </a>
                            `;
                            recommendDiv.appendChild(card);
                        }
                    });
            }

            popupImg.style.display = "none";
            popupImg.style.opacity = 1;
        }, 4000);
    }
});

// --- トップに戻る ---
document.getElementById("back-to-top").addEventListener("click", () => {
    window.location.href = "index.html";
});

// --- 初回ページ生成 ---
createSpread();
loadSpread(currentSpread);
