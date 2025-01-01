const historyNav = () => {
    document.querySelectorAll("[data-url]").forEach((button) => {
        button.addEventListener("click", async (e) => {
            // console.log("create and destroy")
            const url = button.getAttribute("data-url");

            // ?back
            if (url.includes("?back")) {
                main.classList.remove("show");
                history.pushState({}, "", url.replace("?back", ""));
                return;
            }

            history.pushState({}, "", url);

            // Load the page
            const response = await fetch(url);
            if (response.ok) {
                const newContent = await response.text();

                // Extract response
                const parser = new DOMParser();
                const doc = parser.parseFromString(newContent, "text/html");

                // Update the content
                await availableList(doc);

                // Replace the content
                document.title = doc.title;
                const main = document.querySelector("main");
                main.innerHTML =
                    doc.querySelector("main").innerHTML;
                // if (!button.classList.contains("back")) {
                    main.classList.add("show");
                // } else main.classList.remove("show");

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
    availableList();
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
        await availableList(doc);

        // Replace the content
        document.title = doc.title;
        document.querySelector("main").innerHTML =
            doc.querySelector("main").innerHTML;

        historyNav();
    } else {
        console.error("Failed to load the page.");
    }
});

const availableList = async (doc = document) => {
    const available = doc.querySelector(".available");
    if (!available) return;

    available.innerHTML = "";

    const h2 = document.createElement("h2");
    h2.textContent = "Pensum disponibles";

    available.appendChild(h2);

    const dir = "/pensums/";
    const list = await importJSON(dir + "list.json");

    list["listado"].forEach((item) => {
        const element = addListElement(item, "/icons/article.svg", "#" + item);
        available.appendChild(element);
        element.addEventListener("click", async e => {
            const list = await filterJSON(await importJSON(dir + item + ".json"));
            drawPensumTable(list);

            actualPensum.linkName = item;

            drawAside();
        });
    });

    if (actualPensum.linkName) {
        const elementBack = addListElement(`Volver (${actualPensum.linkName})`, "/icons/arrow_back.svg","#"+actualPensum.linkName+"?back");
        elementBack.classList.add("back");
        available.appendChild(elementBack);
    }

    const hash = window.location.hash;
    if (hash) {
        const element = available.querySelector(`[data-url="${hash}"]`);
        if (element) element.click();
    }
};