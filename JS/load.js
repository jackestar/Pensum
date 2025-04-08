const JSONdir = "/pensums/";
let JSONlist = [];

if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("/JS/offline-worker.js")
        .then(reg => console.log("Service Worker registered", reg.scope))
        .catch(err => drawError(`Error al registrar el Service Worker: ${err}`));
}

const historyNav = () => {
    document.querySelectorAll("[data-url]").forEach(button => {
        button.addEventListener("click", async e => {
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
                // await availableList(doc);

                // Replace the content
                document.title = doc.title;
                const main = document.querySelector("main");
                main.innerHTML = doc.querySelector("main").innerHTML;
                main.classList.add("show");

                scriptUpdate();
            } else {
                drawError("Failed to load the page.");
            }
        });
    });
};

const documentLoaded = () => {
    const main = document.querySelector("main");
    main.classList.add("show");

    document.body.addEventListener("dragleave", e => {
        e.preventDefault();
        e.stopPropagation();
    });

    ["dragenter", "dragover"].forEach(eventName => {
        document.body.addEventListener(eventName, e => {
            e.preventDefault();
            e.stopPropagation();
            importRecord();
        });
    });
    ["drop"].forEach(e => {
        document.body.addEventListener(e, ev => {
            e.preventDefault();
            e.stopPropagation();
            const Old = document.querySelector(".banner");
            if (Old) Old.remove();
        });
    });

    scriptUpdate();
};

const scriptUpdate = async () => {
    // Script update
    await availableList();
    formEdit();
    historyNav();
};

// Handle back/forward navigation
window.addEventListener("popstate", async e => {
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
        document.querySelector("main").innerHTML = doc.querySelector("main").innerHTML;

        await scriptUpdate();
    } else {
        drawError("Failed to load the page.");
    }
});

const drawPensumFromJson = async (json, linkname, mode = 0) => {
    const pensum = await filterJSON(json);
    if (pensum.length == 0) {
        drawError(`Pensum ${linkname} no cargado`);
        return;
    }
    
    // Set the mode explicitly
    pensum.selectionMode = mode;
    actualPensum = pensum;
    actualPensum.linkName = linkname;

    let backTo;
    if (mode === 0) {
        backTo = "/view.html";
    } else if (mode === 3) {
        backTo = "/create.html";
    } else {
        backTo = "/index.html";
    }

    await drawAside(backTo);
    drawPensumTable(actualPensum);
    initCanvas();
};

const availableList = async (doc = document) => {
    const available = doc.querySelector(".available");
    if (!available) return;

    available.innerHTML = "";

    const h2 = document.createElement("h2");
    h2.textContent = "Pensum disponibles";

    available.appendChild(h2);
    JSONlist = await importJSON(JSONdir + "list.json");
    if (JSONlist.length == 0) {
        drawError("Listado de Pensums no cargado");
        return;
    }

    JSONlist["Career"].forEach(async item => {
        const element = addListElement(item[1], "/icons/article.svg", "#" + item[0]);
        available.appendChild(element);
        element.addEventListener("click", async e => {
            drawPensumFromJson(await importJSON(JSONdir + item[0] + ".json"), item);
        });
    });

    if (actualPensum.linkName) {
        const elementBack = addListElement(`Volver (${actualPensum.linkName[1]})`, "/icons/arrow_back.svg", "#" + actualPensum.linkName[0] + "?back");
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
    form.addEventListener("submit", e => {
        e.preventDefault();
    });

    // custom select
    const customs = form.querySelectorAll(".custom");
    if (customs.length) {
        customs.forEach(custom => {
            const select = custom.querySelector("select");
            const newDiv = custom.querySelector(".new");

            select.addEventListener("change", e => {
                const value = select.value;
                if (value == "custom") newDiv.classList.add("show");
                else newDiv.classList.remove("show");
            });
        });
    }
    const assignCreate = () => {
        const nameElement = form.querySelector("#career");
        let name = nameElement.value;
        if (name == "") {
            nameElement.classList.add("needed");
            nameElement.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
            return false;
        }
        actualPensum.career = name;

        actualPensum.faculty = form.querySelector("#faculty").value;
        actualPensum.description = form.querySelector("#description").value;
        if (form.querySelector("#term")) actualPensum.terms = parseInt(form.querySelector("#term").value);
        const termName = form.querySelector("#termName").value.split(",");
        if (termName == "custom") actualPensum.termName = [form.querySelector("#termName0").value, form.querySelector("#termName1").value];
        else actualPensum.termName = [termName[0], termName[1]];

        actualPensum.selectionMode = 3;

        actualPensum.linkName = "Nuevo";
        return true;
    };

    // edit pensum
    const edit = form.querySelector("button#edit");
    if (edit)
        edit.addEventListener("click", async e => {
            assignCreate();
            drawPensumTable();
        });

    // create pensum
    const create = form.querySelector("button#create");
    if (create) {
        create.addEventListener("click", async e => {
            actualPensum = Object.create(PensumFormat);
            if (!assignCreate()) return;

            actualPensum.coursesByTerm = Array.from({length: actualPensum.terms}, () => []);

            await drawAside("/create.html");

            drawPensumTable();
            initCanvas();
        });
    }

        // Import Pensum
        const importP = form.querySelector("button#open");
        if (importP)
            importP.addEventListener("click", async e => {
                actualPensum.selectionMode = 3;
                importPensum(3);
            });
};
