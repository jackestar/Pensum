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
                main.innerHTML = doc.querySelector("main").innerHTML;
                // if (!button.classList.contains("back")) {
                main.classList.add("show");
                // } else main.classList.remove("show");

                scriptUpdate();
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
    formEdit();
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

        scriptUpdate();
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
        element.addEventListener("click", async (e) => {
            const list = await filterJSON(
                await importJSON(dir + item + ".json")
            );
            drawPensumTable(list);

            actualPensum.linkName = item;

            drawAside();
        });
    });

    if (actualPensum.linkName) {
        const elementBack = addListElement(
            `Volver (${actualPensum.linkName})`,
            "/icons/arrow_back.svg",
            "#" + actualPensum.linkName + "?back"
        );
        elementBack.classList.add("back");
        available.appendChild(elementBack);
    }

    const hash = window.location.hash;
    if (hash) {
        const element = available.querySelector(`[data-url="${hash}"]`);
        if (element) element.click();
    }
};

const formEdit = (doc = document) => {
    const form = doc.querySelector(".create");
    if (!form) return;

    // Prevent default
    form.addEventListener("submit", (e) => {
        e.preventDefault();
    });

    // custom select
    const customs = form.querySelectorAll(".custom");
    if (customs.length) {
        customs.forEach((custom) => {
            const select = custom.querySelector("select");
            const newDiv = custom.querySelector(".new");

            select.addEventListener("change", (e) => {
                const value = select.value;
                if (value == "custom") newDiv.classList.add("show");
                else newDiv.classList.remove("show");
            });
        });
    }

    // create pensum
    const create = form.querySelector("button#create");
    if (create) {
        create.addEventListener("click", e => {
            actualPensum.career = form.querySelector("#career").value;
            actualPensum.faculty = form.querySelector("#faculty").value;
            actualPensum.description = form.querySelector("#description").value;
            actualPensum.terms = parseInt(form.querySelector("#semester").value);
            const termName = form.querySelector("#termName").value.split(",");
            if (termName == "custom")
                actualPensum.termName = [form.querySelector("#termName0").value, form.querySelector("#termName1").value];
            else
                actualPensum.termName = [termName[0], termName[1]];

            actualPensum.selectionMode = 3;

            actualPensum.linkName = "Nuevo";
            actualPensum.coursesByterm = Array.from({ length: actualPensum.terms }, () => []);

            drawPensumTable(actualPensum);

            drawAside();
        });
    }

};
