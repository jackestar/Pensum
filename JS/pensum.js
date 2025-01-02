// Prototipos

// Current Version
const FormatVersion = 0;

let courseFormat = {
    code: "",
    name: "",
    credits: 0,
    term: 0,
    description: "",
    hours: [0, 0, 0], // theory, practice, lab
    prerequisites: [], // code - prerequisites
    corequisites: [], // code - Other parallel courses
    careerRequirement: [0, 0], // credits, term
    addPrerequisite: (prerequisite) => {
        this.prerequisites.push(prerequisite);
    },
    addCorequisite: (corequisite) => {
        this.corequisites.push(corequisite);
    },
};

let PensumFormat = {
    career: "",
    faculty: "",
    description: "",
    terms: 0,
    termName: ["",""], // singular, plural
    formatVersion: FormatVersion,
    courses: [],
    addCourse: (course) => {
        this.courses.push(course);
    },
};

let actualPensum = Object.create(PensumFormat);
// Selection Mode
// 0 - Star

// Importar/Exportar

// Import JSON

const importJSON = async (url) => {
    const response = await fetch(url);
    if (response.ok) {
        return await response.json();
    } else {
        // Error handling
        console.error("Error importando JSON");
        return [];
    }
};

const filterJSON = async (
    json,
    courseF = courseFormat,
    formatVersion = FormatVersion
) => {
    const courseKeys = Object.keys(courseF).filter(
        (key) => typeof courseF[key] !== "function"
    );
    const pensum = await json;

    if (pensum.formatVersion !== formatVersion) {
        // Error handling
        console.error("Formato de pensum no compatible");
        return [];
    }

    pensum.totalCredits = 0;
    pensum.selectionMode = 0;
    pensum.elementSelected = [];
    pensum.element = [];

    pensum.coursesByterm = Array.from(
        { length: pensum.terms },
        () => []
    );

    pensum.courses = pensum.courses.map((course, index) => {
        let sem = course.term - 1;
        course.index = index;
        course.passes = false;
        course.required = course.required ? course.required : [];
        if (sem) course.available = false;
        if (!course.prerequisites.length) course.available = true;
        if (course.corequisites.length) {
            course.corequisites.forEach((corequisite, index) => {
                const co = pensum.courses.find((c) => c.code === corequisite);
                co.index =
                    co.index == undefined
                        ? pensum.courses.findIndex(
                              (c) => c.code === corequisite
                          )
                        : co.index;
                course.corequisites[index] = co.index;
                co.corequired = true;
            });
        }
        if (course.prerequisites.length) {
            course.prerequisites.forEach((prerequisite, index) => {
                const pr = pensum.courses.find((c) => c.code === prerequisite);
                pr.required
                    ? pr.required.push(course.index)
                    : (pr.required = [course.index]);
                course.prerequisites[index] = pr.index;
            });
        }
        pensum.coursesByterm[sem].push(course);

        filtered = course;
        pensum.totalCredits += course.credits;
        courseKeys.forEach((key) => {
            if (course.hasOwnProperty(key)) {
                filtered[key] = course[key];
            }
        });
        return filtered;
    });
    return pensum;
};

// Element Builder

const addListElement = (name, icon, url) => {
    const div = document.createElement("div");
    if (url) div.setAttribute("data-url", url);
    div.classList.add("available-item");

    const img = document.createElement("img");
    img.src = icon;

    const h3 = document.createElement("h3");
    h3.textContent = name.charAt(0).toUpperCase() + name.slice(1);

    div.appendChild(img);
    div.appendChild(h3);
    div.addEventListener("click", (e) => history.pushState({}, "", url));
    return div;
};

const createPensumTable = (pensum) => {
    actualPensum = pensum;
    terms = pensum.terms;

    const article = document.createElement("article");
    article.classList.add("pensum");
    for (let term = 0; term < terms; term++) {
        const ul = document.createElement("ul");
        ul.classList.add("term");
        const li = document.createElement("li");
        li.classList.add("term");
        li.addEventListener("click", e => {
            actualPensum.coursesByterm[term].forEach((course) => {
                if (actualPensum.selectionMode == 1) elementAction(course.element, course.index)
            });
        });
        const p = document.createElement("p");
        p.textContent = `${actualPensum.termName[0]} ${term + 1}`;

        li.appendChild(p);
        ul.appendChild(li);

        actualPensum.coursesByterm[term].forEach((course) => {
            const li = document.createElement("li");
            li.addEventListener("click", (e) => {
                actualPensum.elementSelected = elementAction(li, course.index);
            });

            const h3 = document.createElement("h3");
            h3.textContent = course.name;

            const p = document.createElement("p");
            p.textContent = course.code;

            const badges = document.createElement("div");
            badges.classList.add("badge");

            const info = document.createElement("div");
            info.classList.add("info");
            const infoIcon = document.createElement("img");
            infoIcon.src = "/icons/info.svg";
            info.addEventListener("click", (e) => infoAction(course.index));
            info.appendChild(infoIcon);

            badges.appendChild(info);

            li.appendChild(h3);
            li.appendChild(p);
            li.appendChild(badges);
            actualPensum.courses[course.index].element = li;
            ul.appendChild(li);
            updateCourse(li, course.index);
        });

        article.appendChild(ul);
    }
    return article;
};

const drawPensumTable = (list) => {
    const article = document.querySelector("article.pensum");
    if (article) article.remove();
    main = document.querySelector("main");

    let pensumTable = createPensumTable(list);
    actualPensum.element = pensumTable;

    main.classList.remove("show");
    document.body.appendChild(pensumTable);
    actualPensum.em = parseInt(
        window
            .getComputedStyle(document.querySelector("article.pensum ul"))
            .padding.slice(0, -2)
    );

    actualPensum.courses.forEach((course) => {
        const posElem = course.element;
        posElem.top = [
            posElem.offsetLeft + posElem.offsetWidth / 2,
            posElem.offsetTop,
        ];
        posElem.bottom = [
            posElem.offsetLeft + posElem.offsetWidth / 2,
            posElem.offsetTop + posElem.offsetHeight,
        ];
        posElem.right = [
            posElem.offsetLeft + posElem.offsetWidth,
            posElem.offsetTop + posElem.offsetHeight / 2,
        ];
        posElem.left = [
            posElem.offsetLeft,
            posElem.offsetTop + posElem.offsetHeight / 2,
        ];
    });
    initCanvas();
};

const drawAside = async () => {
    const aside = document.querySelector("aside");
    if (aside) return;
    const response = await fetch("/aside.html");
    if (response.ok) {
        const newContent = await response.text();

        // Extract response
        const parser = new DOMParser();
        const doc = parser
            .parseFromString(newContent, "text/html")
            .querySelector("aside");

        // Replace the content
        document.body.appendChild(doc);

        asideUpdate(doc);
    } else {
        console.error("Failed to load aside.");
    }
    scriptUpdate();
};

let asideUpdate = (doc) => {
    switch (actualPensum.selectionMode) {
        case 0:
            doc.classList = ["star"];
            break;
        case 1:
            doc.classList = ["path"];
            break;
        default:
            break;
    }
};

updateCourse = (element, index) => {
    const course = actualPensum.courses[index];
    if (course.available) {
        element.classList.remove("unavailable");
        if (course.corequired) element.classList.add("corequired");
        else element.classList.remove("corequired");

        if (course.passes) element.classList.add("passed");
        else element.classList.remove("passed");
    } else {
        element.classList.add("unavailable");
        if (course.availableNext) element.classList.add("available-next");
        else element.classList.remove("available-next");
    }
    return element;
};

const elementAction = (element, index) => {
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = actualPensum.em / 4;
    ctx.beginPath();

    actualPensum.courses.forEach((course) => {
        course.element.classList.remove(
            "sel-act",
            "coreq",
            "prereq",
            "required"
        );
    });
    course = actualPensum.courses[index];

    if (actualPensum.selectionMode == 0) {
        // Star Mode
        if (actualPensum.elementSelected.length) {
            actualPensum.elementSelected[0].classList.remove("selected");
            if (actualPensum.elementSelected[1] == index) {
                actualPensum.element.classList.remove("selection");
                return [];
            }
        } else actualPensum.element.classList.add("selection");
        element.classList.add("selected");
        ctx.setLineDash([5, 15]);
        course.corequisites.forEach((corequisite) => {
            const reElement = actualPensum.courses[corequisite].element;
            reElement.classList.add("coreq", "sel-act");

            if (element.top[1] < reElement.bottom[1]) {
                ctx.moveTo(element.bottom[0], element.bottom[1]);
                if (element.bottom[0] == reElement.top[0])
                    ctx.lineTo(reElement.top[0], reElement.top[1]);
                else {
                    ctx.lineTo(
                        element.bottom[0],
                        reElement.top[1] - actualPensum.em
                    );
                    ctx.lineTo(
                        reElement.top[0],
                        reElement.top[1] - actualPensum.em
                    );
                    ctx.lineTo(reElement.top[0], reElement.top[1]);
                }
            } else {
                ctx.moveTo(element.top[0], element.top[1]);
                if (element.bottom[0] == reElement.top[0])
                    ctx.lineTo(reElement.bottom[0], reElement.bottom[1]);
                else {
                    ctx.lineTo(
                        element.bottom[0],
                        reElement.bottom[1] + actualPensum.em
                    );
                    ctx.lineTo(
                        reElement.bottom[0],
                        reElement.bottom[1] + actualPensum.em
                    );
                    ctx.lineTo(reElement.bottom[0], reElement.bottom[1]);
                }
            }

            ctx.stroke();
        });
        ctx.beginPath();
        ctx.setLineDash([]);
        course.prerequisites.forEach((prerequisite) => {
            const reElement = actualPensum.courses[prerequisite].element;
            reElement.classList.add("prereq", "sel-act");
            ctx.moveTo(element.left[0], element.left[1]);
            ctx.lineTo(element.left[0] - actualPensum.em, element.left[1]);
            ctx.lineTo(element.left[0] - actualPensum.em, reElement.right[1]);
            ctx.lineTo(reElement.right[0], reElement.right[1]);
            ctx.stroke();
        });
        course.required.forEach((req) => {
            const reElement = actualPensum.courses[req].element;
            reElement.classList.add("required", "sel-act");
            ctx.moveTo(element.right[0], element.right[1]);
            ctx.lineTo(element.right[0] + actualPensum.em, element.right[1]);
            ctx.lineTo(element.right[0] + actualPensum.em, reElement.left[1]);
            ctx.lineTo(reElement.left[0], reElement.left[1]);

            ctx.stroke();
        });
    } else if (actualPensum.selectionMode == 1) {
        // Path Mode
        if (course.available) {
            course.passes = !course.passes;
            course.required.forEach((req) => {
                const reCourse = actualPensum.courses[req];
                // console.log(reCourse,reCourse.prerequisites)
                let av = false;
                if (reCourse.prerequisites)
                    av = reCourse.prerequisites.every((prereq) => {
                        // console.log(prereq,actualPensum.courses[prereq].passes,actualPensum.courses[prereq])
                        if (!actualPensum.courses[prereq].passes) {
                            reCourse.passes = false;
                            return false;
                        }
                        return true;
                    });
                if (av) {
                    reCourse.availableNext = true;
                    updateCourse(reCourse.element, reCourse.index);
                } else {
                    reCourse.availableNext = false;
                    updateCourse(reCourse.element, reCourse.index);
                }
            });
        }
    }

    updateCourse(element, index);
    return [element, index];
};

const infoAction = (index) => {
    const infoOld = document.querySelector(".infoBanner");
    if (infoOld) infoOld.remove();


    const course = actualPensum.courses[index];
    const info = document.createElement("div");
    info.classList.add("infoBanner");
    info.addEventListener("click", (e) =>
        e.target == info ? info.remove() : null
    );

    const cont = document.createElement("div");

    const nav = document.createElement("nav");
    const img = document.createElement("img");
    img.src = "/icons/arrow_back.svg";
    img.addEventListener("click", e => info.remove() );
    nav.appendChild(img);
    cont.appendChild(nav);

    const name = document.createElement("h3");
    name.textContent = course.name;
    cont.appendChild(name);

    if (course.code) {
        const code = document.createElement("p");
        code.textContent = course.code;
        code.classList.add("code");
        cont.appendChild(code);
    }

    if (course.description) {
        const description = document.createElement("p");
        description.textContent = course.description;
        description.classList.add("description");
        cont.appendChild(description);
    }

    if (course.credits) {
        const credits = document.createElement("p");
        credits.textContent = `Créditos: ${course.credits}`;
        cont.appendChild(credits);
    }

    if (course.hours) {
        const div = document.createElement("div");
        div.classList.add("hours");
        const img = document.createElement("img");
        img.src = "/icons/info.svg";
        img.addEventListener("click", e => {extendInfo.classList.toggle("show")});

        const hours = document.createElement("p");
        hours.textContent = `Horas: ${course.hours.reduce(
            (i, act) => i + act,
            0
        )}`;

        const extendInfo = document.createElement("div");
        extendInfo.classList.add("extendInfo");
        const ul = document.createElement("ul");
        [
            ["Teoría", "/icons/book.svg"],
            ["Práctica", "/icons/draw.svg"],
            ["Laboratorio", "/icons/experiment.svg"],
        ].forEach((hour, index) => {
            const li = document.createElement("li");
            if (course.hours[index]) {
                const img = document.createElement("img");
                img.src = hour[1];
                const p = document.createElement("p");
                p.textContent = `${hour[0]}: ${course.hours[index]}`;

                li.appendChild(img);
                li.appendChild(p);
                ul.appendChild(li);
            }
        });

        extendInfo.appendChild(ul);

        div.appendChild(hours);
        div.appendChild(img);
        div.appendChild(extendInfo);
        cont.appendChild(div);
    }

    if (course.prerequisites.length) {
        const h4 = document.createElement("h4");
        h4.textContent = "Requisitos";
        cont.appendChild(h4);
        const preCourses = course.prerequisites.map(
            (a) => actualPensum.courses[a]
        );
        const ul = document.createElement("ul");
        preCourses.forEach((pre) => {
            const li = document.createElement("li");
            li.textContent = pre.name;
            li.addEventListener("click", (e) => infoAction(pre.index));
            ul.appendChild(li);
        });
        cont.appendChild(ul);
    }

    if (course.corequisites.length) {
        const h4 = document.createElement("h4");
        h4.textContent = "Corequisitos";
        cont.appendChild(h4);
        const coCourses = course.corequisites.map(
            (a) => actualPensum.courses[a]
        );
        const ul = document.createElement("ul");
        coCourses.forEach((co) => {
            const li = document.createElement("li");
            li.textContent = co.name;
            li.addEventListener("click", (e) => infoAction(co.index));
            ul.appendChild(li);
        });
        cont.appendChild(ul);
    }
    info.appendChild(cont);
    document.body.appendChild(info);
};

// Mode change

const modeChange = (mode) => {
    actualPensum.selectionMode = mode;
    const aside = document.querySelector("aside");

    // Clear Selection Mode
    actualPensum.element.classList.remove("selection");
    if (actualPensum.elementSelected.length)
        actualPensum.elementSelected[0].classList.remove("selected");
    actualPensum.elementSelected = [];

    if (mode == 1) actualPensum.element.classList.add("path");
    else actualPensum.element.classList.remove("path");

    // Clear Canvas
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    asideUpdate(aside);
};

const modeToggle = (mode1, mode2) => {
    modeChange(actualPensum.selectionMode == mode1 ? mode2 : mode1);
};

// Canvas Arrow

const canvas = document.querySelector("canvas.arrow");

const initCanvas = () => {
    canvas.width = actualPensum.element.scrollWidth;
    canvas.height = actualPensum.element.scrollHeight;
};
