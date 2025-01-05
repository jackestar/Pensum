// Prototipos

// Current Version
const FormatVersion = 0;

const courseFormat = {
    code: "",
    name: "",
    credits: 0,
    term: 0,
    description: "",
    hours: [0, 0, 0], // theory, practice, lab
    prerequisites: [], // code - prerequisites
    corequisites: [], // code - Other parallel courses
    careerRequirement: [0, 0], // credits, term
};

const PensumFormat = {
    career: "",
    faculty: "",
    description: "",
    terms: 0,
    termName: ["", ""], // singular, plural
    formatVersion: FormatVersion,
    courses: [],
    coursesByTerm: [],
    addCourse: function (course) {
        this.courses.push(course);
        this.coursesByTerm[course.term - 1].push(course);
    },
    removeCourse: function (index) {
        const course = this.courses[index];
        this.courses.splice(index, 1);
        this.coursesByTerm[course.term - 1].splice(
            this.coursesByTerm[course.term - 1].indexOf(course),
            1
        );
    },
    addTerm: function () {
        this.terms++;
        this.coursesByTerm.push([]);
    },
    removeTerm: function (term = this.terms) {
        if (term > 0 && term <= this.terms && this.terms > 1) {
            this.coursesByTerm[term - 1].forEach((course) => {
                const index = this.courses.indexOf(course);
                const codeCourse = course.code
                this.courses.map(courseReq => {
                    courseReq.corequisites = courseReq.corequisites.filter(code => code != codeCourse)
                    courseReq.prerequisites = courseReq.prerequisites.filter(code => code != codeCourse)
                })
                if (index > -1) {
                    this.courses.splice(index, 1);
                }
            });
            this.coursesByTerm.splice(term - 1, 1);
            this.terms--;
        }
    },
};

let actualPensum = Object.create(PensumFormat);
// Selection Mode
// 0 - Star
// 1 - Path
// 2 - View
// 3 - Edit

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
    pensum.elementSelected = {};
    pensum.actualCredits = 0;
    pensum.element = {};

    pensum.coursesByTerm = Array.from({ length: pensum.terms }, () => []);

    pensum.courses = pensum.courses.map((course, index) => {
        let sem = course.term - 1;
        // course.index = index;
        course.passes = false;
        course.required = course.required ? course.required : [];
        course.corequired = course.corequired ? course.corequired : [];
        if (sem) course.available = false;
        if (!course.prerequisites.length) {
            course.available = true;
        }
        if (course.corequisites.length) {
            course.corequisites.forEach((corequisite, index) => {
                const co = pensum.courses.find((c) => c.code === corequisite);
                co.corequired
                    ? co.corequired.push(pensum.courses.indexOf(course))
                    : (co.corequired = [pensum.courses.indexOf(course)]);
                course.corequisites[index] = pensum.courses.indexOf(co);
                // co.corequired = true;
            });
        }
        if (course.prerequisites.length) {
            course.prerequisites.forEach((prerequisite, index) => {
                const pr = pensum.courses.find((c) => c.code === prerequisite);
                pr.required
                    ? pr.required.push(pensum.courses.indexOf(course))
                    : (pr.required = [pensum.courses.indexOf(course)]);
                course.prerequisites[index] = pensum.courses.indexOf(pr);
            });
        }
        if (course.careerRequirement) {
            if (course.careerRequirement[0]) course.available = false;
            if (course.careerRequirement[1]) course.available = false;
        }
        pensum.coursesByTerm[sem].push(course);

        filtered = course;
        pensum.totalCredits += course.credits;
        courseKeys.forEach((key) => {
            if (course.hasOwnProperty(key)) {
                filtered[key] = course[key];
            }
        });
        return filtered;
    });
    pensum.courses.forEach((course) => {
        if (course.corequisites.length && course.term > 1) {
            course.available &= course.corequisites.every(co => {
                pensum.courses[co].available
            })
        }
    })
    return pensum;
};

// Export Json

const exportJson = (pensum = actualPensum) => {

}

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
        li.addEventListener("click", (e) => {
            if (actualPensum.coursesByTerm[term].length) {
                const filtered = actualPensum.coursesByTerm[term].filter(course => course.available)
                const isAllPassed = filtered.every(course => course.passes)
                if (actualPensum.selectionMode == 1 || actualPensum.selectionMode == 2)
                filtered.forEach((course) => {
                        if (!isAllPassed)
                            course.passes = false

                        elementAction(course.element, pensum.courses.indexOf(course))
                });
            }
        });
        const p = document.createElement("p");
        p.textContent = `${actualPensum.termName[0]} ${term + 1}`;

        if (actualPensum.selectionMode == 3) {
            const badges = document.createElement("div");
            badges.classList.add("badge");

            const del = document.createElement("div");
            del.classList.add("del");
            const delIcon = document.createElement("img");
            delIcon.src = "/icons/delete.svg";
            del.addEventListener("click", (e) => {
                actualPensum.removeTerm(term + 1);
                drawPensumTable(actualPensum);
            });
            del.appendChild(delIcon);

            badges.appendChild(del);

            li.appendChild(badges);
        }

        li.appendChild(p);
        ul.appendChild(li);

        actualPensum.coursesByTerm[term].forEach((course) => {
            const li = document.createElement("li");
            li.addEventListener("click", (e) => {
                actualPensum.elementSelected = elementAction(li, pensum.courses.indexOf(course));
            });

            const h3 = document.createElement("h3");
            h3.textContent = course.name;

            const p = document.createElement("p");
            p.textContent = course.code;

            const badges = document.createElement("div");
            badges.classList.add("badge");

            if (actualPensum.selectionMode == 3) {
                const edit = document.createElement("div");
                edit.classList.add("edit");
                const editIcon = document.createElement("img");
                editIcon.src = "/icons/edit_square.svg";
                // edit.addEventListener("click", (e) => editAction(course.index));
                edit.appendChild(editIcon);

                const del = document.createElement("div");
                del.classList.add("del");
                const delIcon = document.createElement("img");
                delIcon.src = "/icons/delete.svg";
                del.addEventListener("click", (e) => {
                    actualPensum.removeCourse(pensum.courses.indexOf(course));
                    drawPensumTable(actualPensum);
                });
                del.appendChild(delIcon);

                badges.appendChild(del);
                badges.appendChild(edit);
            } else {
                const info = document.createElement("div");
                info.classList.add("info");
                const infoIcon = document.createElement("img");
                infoIcon.src = "/icons/info.svg";
                info.addEventListener("click", (e) => infoAction(pensum.courses.indexOf(course)));
                info.appendChild(infoIcon);

                badges.appendChild(info);
            }

            li.appendChild(h3);
            li.appendChild(p);
            li.appendChild(badges);
            course.element = li;
            // actualPensum.courses[course.index].element = li;
            ul.appendChild(li);
            updateCourse(li, pensum.courses.indexOf(course));
        });
        if (actualPensum.selectionMode == 3) {
            const li = document.createElement("li");
            li.classList.add("add");
            const img = document.createElement("img");
            img.src = "/icons/add.svg";
            li.appendChild(img);

            li.addEventListener("click", (e) => addCourseAction(term + 1));
            ul.appendChild(li);
        }

        article.appendChild(ul);
    }
    if (actualPensum.selectionMode == 3) {
        const ul = document.createElement("ul");
        ul.classList.add("term", "add");
        const li = document.createElement("li");
        li.classList.add("term");
        const p = document.createElement("p");
        p.textContent = `Añadir ${actualPensum.termName[0]}`;
        li.appendChild(p);

        li.addEventListener("click", (e) => {
            actualPensum.addTerm();
            drawPensumTable(actualPensum);
        });

        ul.appendChild(li);
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
    // initCanvas();
};

const drawAside = async (
    back = "/index.html",
    mode = actualPensum.selectionMode
) => {
    const aside = document.querySelector("aside");
    if (aside) {
        if (aside.querySelector("li.back").getAttribute("data-url") == back) {
            asideUpdate(aside); // Use the existing aside element
            return;
        } else {
            aside.remove();
        }
    }
    const response = await fetch("/aside.html");
    if (response.ok) {
        const newContent = await response.text();

        // Extract response
        const parser = new DOMParser();
        const doc = parser
            .parseFromString(newContent, "text/html")
            .querySelector("aside");

        doc.querySelector("li.back").setAttribute("data-url", back);

        // buttons

        doc.querySelector(".addTerm").addEventListener("click", (e) => {
            actualPensum.addTerm();
            drawPensumTable(actualPensum);
        });

        doc.querySelector(".addCourse").addEventListener("click", (e) => {
            addCourseAction();
            drawPensumTable(actualPensum);
        });

        doc.querySelector(".exportJSON").addEventListener("click", (e) => {
            exportJson();
        });

        doc.querySelector(".importRecord").addEventListener("click", (e) => {
            importRecord();
        });

        asideUpdate(doc);

        // Replace the content
        document.body.appendChild(doc);

        // remove old asides
        // foced solution for now
        document.querySelectorAll("aside").forEach((aside) => {
            if (aside != doc) aside.remove();
        });
    } else {
        console.error("Failed to load aside.");
    }
    historyNav();
    // scriptUpdate();
};

let asideUpdate = (doc) => {
    switch (actualPensum.selectionMode) {
        case 0:
            doc.classList = ["star"];
            break;
        case 1:
            doc.classList = ["path"];
            break;
        case 2:
            doc.classList = ["view"];
            break;
        case 3:
            doc.classList = ["edit"];
            break;
        default:
            break;
    }
};

updateCourse = (element, index) => {
    const course = actualPensum.courses[index];
    if (!course) return;

    if (course.available) {
        element.classList.remove("unavailable");
        if (course.corequired.length) element.classList.add("corequired");
        else element.classList.remove("corequired");

        if (course.passes) element.classList.add("passed");
        else element.classList.remove("passed");
    } else {
        element.classList.add("unavailable");
        element.classList.remove("passed");
        if (course.availableNext) element.classList.add("available-next");
        else element.classList.remove("available-next");
    }
    return element;
};

const elementAction = (element, index) => {
    if (actualPensum.courses[index] == undefined) return [];
    let ctx = initCanvas();
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Overkill
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
            if (course.passes) {
                course.passes = false
                actualPensum.actualCredits -= course.credits
            }
            else {
                course.passes = true
                actualPensum.actualCredits += course.credits
            }
            course.required.forEach((req) => {
                const reCourse = actualPensum.courses[req];
                let av = false;
                if (reCourse.prerequisites)
                    av = reCourse.prerequisites.every((prereq) => {
                        if (!actualPensum.courses[prereq].passes) {
                            reCourse.passes = false;
                            return false;
                        }
                        return true;
                    });
                if (av) reCourse.availableNext = true;
                else reCourse.availableNext = false;
                updateCourse(reCourse.element, actualPensum.courses.indexOf(reCourse));
            });
        }
    } else if (actualPensum.selectionMode == 2) {
        // View Mode
        if (course.available) {
            if (course.passes) {
                course.passes = false
                actualPensum.actualCredits -= course.credits
            }
            else {
                course.passes = true
                actualPensum.actualCredits += course.credits
            }
            const requiredChain = (required,unchain = true) => {
                required.forEach((req) => {
                    const reCourse = actualPensum.courses[req];
                    // console.log(reCourse)
                    let av = true;
                    if (reCourse.prerequisites.length)
                        av &= reCourse.prerequisites.every(prereq => actualPensum.courses[prereq].passes)
                    if (reCourse.corequisites.length)
                        av &= reCourse.corequisites.every(coreq => actualPensum.courses[coreq].available)

                    if (av) {
                        reCourse.available = true;
                    } else {
                        reCourse.available = false;
                        actualPensum.actualCredits -= reCourse.credits
                        reCourse.passes = false
                    }
                    requiredChain(reCourse.required)
                    if (unchain) {
                        requiredChain(reCourse.corequired,false)
                    }
                    updateCourse(reCourse.element, actualPensum.courses.indexOf(reCourse));
                });
            }
            requiredChain(course.corequired);
            requiredChain(course.required);
        } else {
            // course.passes = false
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
    info.classList.add("infoBanner", "banner");
    info.addEventListener("click", (e) =>
        e.target == info ? info.remove() : null
    );

    const cont = document.createElement("div");

    const nav = document.createElement("nav");
    const img = document.createElement("img");
    img.src = "/icons/arrow_back.svg";
    img.addEventListener("click", (e) => info.remove());
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
        img.addEventListener("click", (e) => {
            extendInfo.classList.toggle("show");
        });

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

    if (course.prerequisites.length || course.careerRequirement) {
        const h4 = document.createElement("h4");
        h4.textContent = "Requisitos";
        cont.appendChild(h4);
        if (course.careerRequirement) {
            const ul = document.createElement("ul");
            // h4.textContent = "Requisitos de Carrera";
            if (course.careerRequirement[0]) {
                const li = document.createElement("li");
                li.textContent = `${course.careerRequirement[0]} Créditos`;
                ul.appendChild(li);
            }
            if (course.careerRequirement[1]) {
                const li = document.createElement("li");
                li.textContent = `${course.careerRequirement[1]} ${actualPensum.termName[0]}`;
                ul.appendChild(li);
            }
            cont.appendChild(ul);
        }
        const preCourses = course.prerequisites.map(
            (a) => actualPensum.courses[a]
        );
        const ul = document.createElement("ul");
        preCourses.forEach((pre) => {
            const li = document.createElement("li");
            li.textContent = pre.name;
            li.addEventListener("click", (e) => infoAction(actualPensum.courses.indexOf(pre)));
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
            li.addEventListener("click", (e) => infoAction(actualPensum.courses.indexOf(co)));
            ul.appendChild(li);
        });
        cont.appendChild(ul);
    }
    info.appendChild(cont);
    document.body.appendChild(info);
};

const addCourseAction = (term = actualPensum.terms) => {
    const newCourse = structuredClone(courseFormat);
    newCourse.required = [];
    const Old = document.querySelector(".addBanner");
    if (Old) infoOld.remove();
    const addBanner = document.createElement("div");
    addBanner.classList.add("addBanner", "banner");
    addBanner.addEventListener("click", (e) =>
        e.target == addBanner ? addBanner.remove() : null
    );
    const cont = document.createElement("div");
    const form = document.createElement("form");
    form.classList.add("courseForm");

    const fields = [
        {
            label: "Código",
            name: "code",
            type: "text",
            placeholder: "Código del Curso",
        },
        {
            label: "Nombre",
            name: "name",
            type: "text",
            placeholder: "Nombre del Curso",
        },
        {
            label: "Créditos",
            name: "credits",
            type: "number",
            placeholder: "Créditos del Curso",
            value: 0,
            min: 0,
        },
        {
            label: "Termino",
            name: "term",
            type: "number",
            placeholder: "Termino del Curso",
            value: term,
            min: 1,
        },
        {
            label: "Descripción",
            name: "description",
            type: "textarea",
            placeholder: "Descripción del Curso",
        },
        {
            label: "Créditos Requeridos",
            name: "careerRequirementCredits",
            type: "number",
            placeholder: "Créditos Requeridos",
            value: 0,
            min: 0,
            subType: true,
        },
        {
            label: "Termino Requerido",
            name: "careerRequirementTerm",
            type: "number",
            placeholder: "Termino Requerido",
            value: 0,
            min: 0,
        },
    ];
    const hoursFilds = [
        {
            label: "Teoría",
            name: "hoursTheory",
            type: "number",
            placeholder: "Horas de Teoría",
            value: 0,
            min: 0,
        },
        {
            label: "Práctica",
            name: "hoursPractice",
            type: "number",
            placeholder: "Horas de Práctica",
            value: 0,
            min: 0,
            subType: true,
        },
        {
            label: "Laboratorio",
            name: "hoursLab",
            type: "number",
            placeholder: "Horas de Laboratorio",
            value: 0,
            min: 0,
            subType: true,
        },
    ];

    const appendField = (field) => {
        const div = document.createElement("div");
        div.classList.add("form");

        const label = document.createElement("label");
        label.setAttribute("for", field.name);
        label.textContent = field.label;

        let input;
        if (field.type === "textarea") {
            input = document.createElement("textarea");
        } else {
            input = document.createElement("input");
            input.setAttribute("type", field.type);
        }
        input.setAttribute("name", field.name);
        input.setAttribute("id", field.name);
        input.setAttribute("placeholder", field.placeholder);
        if (field.value != undefined) input.setAttribute("value", field.value);
        if (field.min != undefined) input.setAttribute("min", field.min);

        div.appendChild(label);
        div.appendChild(input);
        return div;
    };

    fields.forEach((field) => {
        form.appendChild(appendField(field));
    });

    // Hours

    const hoursDiv = document.createElement("div");
    hoursDiv.classList.add("form", "hours");

    const h4 = document.createElement("h4");
    h4.textContent = "Horas";
    hoursDiv.appendChild(h4);

    hoursFilds.forEach(field => hoursDiv.appendChild(appendField(field)));

    form.appendChild(hoursDiv);

    // Courses Requisites
    const requisitesDiv = document.createElement("div");
    requisitesDiv.classList.add("form", "requisites");
    if (actualPensum.courses.length) {
        let selectMode = 0; // 0 - Prerequisites, 1 - Corequisites
        const mode = document.createElement("div");
        mode.classList.add("mode");
        const co = document.createElement("button");
        const pre = document.createElement("button");
        pre.textContent = "Prerrequisito";
        pre.classList.add("preSelected");
        co.textContent = "Corequisito";
        pre.addEventListener("click", (e) => {
            e.preventDefault();
            selectMode = 0;
            pre.classList.add("preSelected");
            co.classList.remove("coSelected");
        });
        co.addEventListener("click", (e) => {
            e.preventDefault();
            selectMode = 1;
            co.classList.add("coSelected");
            pre.classList.remove("preSelected");
        });

        mode.appendChild(pre);
        mode.appendChild(co);
        requisitesDiv.appendChild(mode);
        const ul = document.createElement("ul");

        // all requisites are stored by code and not by index
        // when export this will be translated

        const drawRequisitesTable = (a) => {
            ul.innerHTML = "";
            actualPensum.courses
                .filter((course) => course.term < parseInt(form.term.value))
                .forEach((course) => {
                    const li = document.createElement("li");
                    const h5 = document.createElement("h5");
                    h5.textContent = course.name;
                    const p = document.createElement("p");
                    p.textContent = course.code;

                    if (newCourse.prerequisites.includes(course.code)) {
                        li.classList.add("preSelected");
                    } else {
                        li.classList.remove("preSelected");
                    }
                    if (newCourse.corequisites.includes(course.code)) {
                        li.classList.add("coSelected");
                    } else {
                        li.classList.remove("coSelected");
                    }

                    li.appendChild(h5);
                    li.appendChild(p);

                    li.addEventListener("click", (e) => {
                        [relation, otherRelation, requiredRelation] =
                             selectMode === 0 ?
                            ['prerequisites','corequisites','required']:
                            ['corequisites','prerequisites','corequisites']
                      
                        if (newCourse[relation].includes(course.code)) {
                          newCourse[relation] = newCourse[relation].filter(code => code !== course.code);
                          course[requiredRelation] = course[requiredRelation].filter(code => code !== newCourse.code);
                        } else {
                          newCourse[relation].push(course.code);
                          course[requiredRelation].push(newCourse.code);
                          if (newCourse[otherRelation].includes(course.code)) {
                            newCourse[otherRelation] = newCourse[otherRelation].filter(code => code !== course.code);
                            course[otherRelation] = course[otherRelation].filter(code => code !== newCourse.code);
                          }
                        }
                        drawRequisitesTable();
                    });
                    ul.appendChild(li);
                });
        };

        form.term.addEventListener("change", drawRequisitesTable);
        drawRequisitesTable();
        requisitesDiv.appendChild(ul);
    } else {
        const p = document.createElement("p");
        p.textContent = "No hay cursos disponibles";
        requisitesDiv.appendChild(p);
    }

    form.appendChild(requisitesDiv);

    const submitDiv = document.createElement("div");
    submitDiv.classList.add("form", "submit");

    const submitButton = document.createElement("button");
    submitButton.setAttribute("type", "submit");
    submitButton.textContent = "Añadir Curso";
    submitButton.id = "create";

    submitDiv.appendChild(submitButton);
    form.appendChild(submitDiv);

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const existingCourse = actualPensum.courses.find(
            (course) => course.code === form.code.value
        );

        if (existingCourse || form.code.value == "") {
            form.code.classList.add("needed");
            form.code.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        } else {
            form.code.classList.remove("needed");
        }
        newCourse.code = form.code.value;
        newCourse.name = form.name.value;
        newCourse.credits = parseInt(form.credits.value);
        newCourse.term = parseInt(form.term.value);
        newCourse.description = form.description.value;
        newCourse.careerRequirement = [
            parseInt(form.careerRequirementCredits.value),
            parseInt(form.careerRequirementTerm.value),
        ];

        // calculate availability...
        newCourse.available = false;

        // newCourse.index = actualPensum.courses.length;

        actualPensum.addCourse(newCourse);
        drawPensumTable(actualPensum);
        addBanner.remove();
    });

    cont.appendChild(form);
    addBanner.appendChild(cont);
    document.body.appendChild(addBanner);
};

const openAction = () => {

}

const importRecord = () => {

}

// Mode change

const modeChange = (mode) => {
    actualPensum.selectionMode = mode;
    const aside = document.querySelector("aside");

    // Clear Selection Mode
    actualPensum.element.classList.remove("selection");
    if (actualPensum.elementSelected.length)
        actualPensum.elementSelected[0].classList.remove("selected");
    actualPensum.elementSelected = [];

    if (mode == 1 || mode == 2) actualPensum.element.classList.add("path");
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
    return canvas.getContext("2d");
};