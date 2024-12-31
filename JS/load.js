const historyNav = () => {
    document.querySelectorAll("[data-url]").forEach((button) => {
        button.addEventListener("click", async (e) => {
            const url = button.getAttribute("data-url");

            history.pushState({}, "", url);

            // Load the page
            const response = await fetch(url);
            if (response.ok) {
                const newContent = await response.text();

                // Extract response
                const parser = new DOMParser();
                const doc = parser.parseFromString(newContent, "text/html");

                // Update the content
                await aviableList(doc);

                // Replace the content
                document.title = doc.title;
                document.querySelector("main").innerHTML =
                    doc.querySelector("main").innerHTML;

                historyNav();
            } else {
                console.error("Failed to load the page.");
            }
        });
    });
};

const scriptUpdate = () => {
    // Script update
    historyNav();
    aviableList();
};

// Handle back/forward navigation
window.addEventListener("popstate", async (e) => {
    const url = location.pathname;

    // Fetch and update content when navigating back/forward
    const response = await fetch(url);
    if (response.ok) {
        const newContent = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(newContent, "text/html");

        // Update the content
        await aviableList(doc);

        // Replace the content
        document.title = doc.title;
        document.querySelector("main").innerHTML =
            doc.querySelector("main").innerHTML;

        historyNav();
    } else {
        console.error("Failed to load the page.");
    }
});

const aviableList = async (doc = document) => {
    const aviable = doc.querySelector(".aviable");
    if (!aviable) return;

    aviable.innerHTML = "";

    const h2 = document.createElement("h2");
    h2.textContent = "Pensum disponibles";

    aviable.appendChild(h2);

    const dir = "/pensums/";
    const list = await importJSON(dir + "list.json");

    list["listado"].forEach((item) => {
        const element = addListElement(item, "/icons/article.svg", "#" + item);
        aviable.appendChild(element);
        element.addEventListener("click", async e => {

            main = document.querySelector("main");
            const list = await importJSON(dir + item + ".json");

            const article = document.querySelector("article.pensum");
            if (article) article.remove();
            
            let pensumTable = createPensumTable(list)
            actualPensum.element = pensumTable;

            main.style.display = "none";
            document.body.appendChild(pensumTable);
            actualPensum.em = parseInt(window.getComputedStyle(document.querySelector("article.pensum ul")).padding.slice(0,-2));

            actualPensum.courses.forEach(course => {
                const posElem = course.element;
                posElem.top = [posElem.offsetLeft + posElem.offsetWidth/2, posElem.offsetTop];
                posElem.bottom = [posElem.offsetLeft + posElem.offsetWidth/2, posElem.offsetTop + posElem.offsetHeight];
                posElem.right = [posElem.offsetLeft + posElem.offsetWidth, posElem.offsetTop + posElem.offsetHeight/2];
                posElem.left = [posElem.offsetLeft, posElem.offsetTop + posElem.offsetHeight/2];
            })
            initCanvas();
        });
    });

    const hash = window.location.hash;
    if (hash) {
        const element = aviable.querySelector(`[data-url="${hash}"]`);
        if (element) element.click();
    }
};