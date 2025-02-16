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
    addCourse: function (course) {
        this.courses.push(course);
        this.coursesByTerm[course.term - 1].push(course);
    },
    removeCourse: function (index) {
        const course = this.courses[index];
        this.courses.splice(index, 1);
        this.coursesByTerm[course.term - 1].splice(this.coursesByTerm[course.term - 1].indexOf(course), 1);
    },
    addTerm: function () {
        this.terms++;
        this.coursesByTerm.push([]);
    },
    removeTerm: function (term = this.terms) {
        if (term > 0 && term <= this.terms && this.terms > 1) {
            this.coursesByTerm[term - 1].forEach(course => {
                const index = this.courses.indexOf(course);
                const codeCourse = course.code;
                this.courses.map(courseReq => {
                    courseReq.corequisites = courseReq.corequisites.filter(code => code != codeCourse);
                    courseReq.prerequisites = courseReq.prerequisites.filter(code => code != codeCourse);
                });
                if (index > -1) {
                    this.courses.splice(index, 1);
                }
            });
            if (term < this.terms)
                this.coursesByTerm
                    .slice(-this.terms + term)
                    .flat()
                    .forEach(course => course.term--);
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

const importJSON = async url => {
    const response = await fetch(url);
    if (response.ok) {
        return await response.json();
    } else {
        drawError("Error importando JSON");
        return [];
    }
};
const filter = (object, filterObject) => {
    const objectKeys = Object.keys(filterObject).filter(key => typeof filterObject[key] !== "function");
    filtered = {};
    objectKeys.forEach(key => {
        if (object.hasOwnProperty(key)) {
            filtered[key] = object[key];
        }
    });
    return filtered;
};
const courseFilter = (course, courseF = courseFormat) => {
    return filter(course, courseF);
};
const formatFilter = (pensum, pensumF = PensumFormat) => {
    return filter(pensum, pensumF);
};

const filterJSON = async (json, formatVersion = FormatVersion) => {
    const pensum = formatFilter(await json);

    if (pensum.formatVersion !== formatVersion) {
        drawError("Formato de pensum no compatible");
        return [];
    }

    pensum.totalCredits = 0;
    pensum.selectionMode = 0;
    pensum.elementSelected = {};
    pensum.actualCredits = 0;
    pensum.element = {};

    pensum.coursesByTerm = Array.from({length: pensum.terms}, () => []);

    pensum.courses = pensum.courses.map((course, index) => {
        pensum.totalCredits += course.credits;
        // course = courseFilter(course);
        let sem = course.term - 1;
        course.passed = false;
        course.required = course.required ? course.required : [];
        course.corequired = course.corequired ? course.corequired : [];
        if (sem) course.available = false;
        if (!course.prerequisites.length) {
            course.available = true;
        }
        if (course.corequisites.length) {
            course.corequisites.forEach((corequisite, index) => {
                const co = pensum.courses.find(c => c.code === corequisite);
                co.corequired ? co.corequired.push(pensum.courses.indexOf(course)) : (co.corequired = [pensum.courses.indexOf(course)]);
                course.corequisites[index] = pensum.courses.indexOf(co);
            });
        }
        if (course.prerequisites.length) {
            course.prerequisites.forEach((prerequisite, index) => {
                const pr = pensum.courses.find(c => c.code === prerequisite);
                pr.required ? pr.required.push(pensum.courses.indexOf(course)) : (pr.required = [pensum.courses.indexOf(course)]);
                course.prerequisites[index] = pensum.courses.indexOf(pr);
            });
        }
        if (course.careerRequirement) {
            if (course.careerRequirement[0]) course.available = false;
            if (course.careerRequirement[1]) course.available = false;
        }
        pensum.coursesByTerm[sem].push(course);
        return course;
    });
    pensum.courses.forEach(course => {
        if (course.corequisites.length && course.term > 1) {
            course.available &= course.corequisites.every(co => {
                pensum.courses[co].available;
            });
        }
    });
    return pensum;
};

// Export Json

const exportJson = (pensum = actualPensum) => {
    pensum = formatFilter(actualPensum);
    pensum.courses = [...pensum.courses].map((course, index) => {
        course.corequisites.forEach((cor, i) => (pensum.courses[index].corequisites[i] = pensum.courses[cor].code));
        course.prerequisites.forEach((pre, i) => (pensum.courses[index].prerequisites[i] = pensum.courses[pre].code));
        return courseFilter(course);
    });

    const jsonString = JSON.stringify(pensum);
    const url = URL.createObjectURL(new Blob([jsonString], {type: "application/json"}));

    const a = document.createElement("a");
    a.href = url;
    a.download = `${actualPensum.linkName}.json`;
    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
    // div.addEventListener("click", e => history.pushState({}, "", url));
    return div;
};

const createPensumTable = pensum => {
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
            if (actualPensum.coursesByTerm[term].length) {
                const filtered = actualPensum.coursesByTerm[term].filter(course => course.available);
                const isAllPassed = filtered.every(course => course.passed);
                if (actualPensum.selectionMode == 1 || actualPensum.selectionMode == 2)
                    filtered.forEach(course => {
                        if (!isAllPassed) course.passed = false;
                        if (!course.readonly) elementAction(course.element, pensum.courses.indexOf(course));
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
            del.addEventListener("click", e => {
                actualPensum.removeTerm(term + 1);
                drawPensumTable(actualPensum);
            });
            del.appendChild(delIcon);

            badges.appendChild(del);

            li.appendChild(badges);
        }

        li.appendChild(p);
        ul.appendChild(li);

        actualPensum.coursesByTerm[term].forEach(course => {
            const li = document.createElement("li");
            li.addEventListener("click", e => {
                if (!course.readonly) actualPensum.elementSelected = elementAction(li, pensum.courses.indexOf(course));
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
                edit.addEventListener("click", e => editCourseAction(course));
                edit.appendChild(editIcon);

                const del = document.createElement("div");
                del.classList.add("del");
                const delIcon = document.createElement("img");
                delIcon.src = "/icons/delete.svg";
                del.addEventListener("click", e => {
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
                info.addEventListener("click", e => infoAction(pensum.courses.indexOf(course)));
                info.appendChild(infoIcon);

                badges.appendChild(info);
            }

            li.appendChild(h3);
            li.appendChild(p);
            li.appendChild(badges);
            course.element = li;
            ul.appendChild(li);
            updateCourse(li, pensum.courses.indexOf(course));
        });
        if (actualPensum.selectionMode == 3) {
            const li = document.createElement("li");
            li.classList.add("add");
            const img = document.createElement("img");
            img.src = "/icons/add.svg";
            li.appendChild(img);

            li.addEventListener("click", e => addCourseAction(term + 1));
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

        li.addEventListener("click", e => {
            actualPensum.addTerm();
            drawPensumTable(actualPensum);
        });

        ul.appendChild(li);
        article.appendChild(ul);
    }
    return article;
};

const drawPensumTable = list => {
    const article = document.querySelector("article.pensum");
    if (article) article.remove();
    main = document.querySelector("main");

    let pensumTable = createPensumTable(list);
    actualPensum.element = pensumTable;

    main.classList.remove("show");
    document.querySelector(".container").appendChild(pensumTable);
    actualPensum.em = parseInt(window.getComputedStyle(document.querySelector("article.pensum ul")).padding.slice(0, -2));

    actualPensum.courses.forEach(course => {
        const posElem = course.element;
        posElem.top = [posElem.offsetLeft + posElem.offsetWidth / 2, posElem.offsetTop];
        posElem.bottom = [posElem.offsetLeft + posElem.offsetWidth / 2, posElem.offsetTop + posElem.offsetHeight];
        posElem.right = [posElem.offsetLeft + posElem.offsetWidth, posElem.offsetTop + posElem.offsetHeight / 2];
        posElem.left = [posElem.offsetLeft, posElem.offsetTop + posElem.offsetHeight / 2];
    });
};

const drawAside = async (back = "/index.html", mode = actualPensum.selectionMode) => {
    aside = document.querySelector("aside");
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
        const doc = parser.parseFromString(newContent, "text/html").querySelector("aside");

        doc.querySelector("li.back").setAttribute("data-url", back);

        // buttons

        doc.querySelector(".addTerm").addEventListener("click", e => {
            actualPensum.addTerm();
            drawPensumTable(actualPensum);
        });
        doc.querySelector(".editCreate").addEventListener("click", e => {
            editCreate();
        });

        doc.querySelector(".addCourse").addEventListener("click", e => {
            addCourseAction();
            drawPensumTable(actualPensum);
        });

        doc.querySelector(".exportJSON").addEventListener("click", e => {
            exportJson();
        });

        doc.querySelector(".importRecord").addEventListener("click", e => {
            importRecord();
        });

        asideUpdate(doc);

        // Replace the content
        document.body.appendChild(doc);

        // remove old asides
        // foced solution for now
        document.querySelectorAll("aside").forEach(aside => {
            if (aside != doc) aside.remove();
        });
    } else {
        drawError("Failed to load aside.");
    }
    historyNav();
};

let asideUpdate = (doc = document.querySelector("aside")) => {
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
    } else {
        element.classList.add("unavailable");
    }
    if (course.readonly) element.classList.add("readonly");
    else {
        element.classList.remove("readonly");
        if (course.passed) element.classList.add("passed");
        else element.classList.remove("passed");
    }
    if (course.availableNext) element.classList.add("available-next");
    else element.classList.remove("available-next");
    return element;
};

const calculateAvailability = course => {
    let av = true;
    if (course.prerequisites.length) av &= course.prerequisites.every(prereq => actualPensum.courses[prereq].passed);
    if (course.corequisites.length) av &= course.corequisites.every(coreq => actualPensum.courses[coreq].available || actualPensum.courses[coreq].availableNext);
    if (course.careerRequirement) av &= course.careerRequirement[0] <= actualPensum.actualCredits;
    return av;
};
let requiredAction = () => {};
const requiredChain = (required, chain = []) => {
    required.forEach(req => {
        chain.push(req);
        const reCourse = actualPensum.courses[req];
        requiredAction(reCourse);

        requiredChain(
            reCourse.required.filter(c => !chain.includes(c)),
            chain
        );
        requiredChain(
            reCourse.corequired.filter(c => !chain.includes(c)),
            chain
        );
        updateCourse(reCourse.element, actualPensum.courses.indexOf(reCourse));
    });
};
const pathCourseCalc = course => {
    requiredAction = course => {
        if (calculateAvailability(course) && !course.available) course.availableNext = true;
        else course.availableNext = false;
    };
    requiredChain(course.corequired);
    requiredChain(course.required);
};
const viewCourseCalc = course => {
    requiredAction = course => {
        if (calculateAvailability(course)) {
            course.available = true;
            course.availableNext = false;
        } else {
            if (course.passed) {
                actualPensum.actualCredits -= course.credits;
                course.passed = false;
            }
            course.available = false;
        }
    };
    requiredChain(course.corequired);
    requiredChain(course.required);
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

    course = actualPensum.courses[index];

    if (actualPensum.selectionMode == 0) {
        // Star Mode
        actualPensum.courses.forEach(course => {
            course.element.classList.remove("sel-act", "coreq", "prereq", "required");
        });
        if (actualPensum.elementSelected.length) {
            actualPensum.elementSelected[0].classList.remove("selected");
            if (actualPensum.elementSelected[1] == index) {
                actualPensum.element.classList.remove("selection");
                return [];
            }
        } else actualPensum.element.classList.add("selection");
        element.classList.add("selected");
        ctx.setLineDash([5, 15]);
        course.corequisites.forEach(corequisite => {
            const reElement = actualPensum.courses[corequisite].element;
            reElement.classList.add("coreq", "sel-act");

            if (element.top[1] < reElement.bottom[1]) {
                ctx.moveTo(element.bottom[0], element.bottom[1]);
                if (element.bottom[0] == reElement.top[0]) ctx.lineTo(reElement.top[0], reElement.top[1]);
                else {
                    ctx.lineTo(element.bottom[0], reElement.top[1] - actualPensum.em);
                    ctx.lineTo(reElement.top[0], reElement.top[1] - actualPensum.em);
                    ctx.lineTo(reElement.top[0], reElement.top[1]);
                }
            } else {
                ctx.moveTo(element.top[0], element.top[1]);
                if (element.bottom[0] == reElement.top[0]) ctx.lineTo(reElement.bottom[0], reElement.bottom[1]);
                else {
                    ctx.lineTo(element.bottom[0], reElement.bottom[1] + actualPensum.em);
                    ctx.lineTo(reElement.bottom[0], reElement.bottom[1] + actualPensum.em);
                    ctx.lineTo(reElement.bottom[0], reElement.bottom[1]);
                }
            }

            ctx.stroke();
        });
        ctx.beginPath();
        ctx.setLineDash([]);
        course.prerequisites.forEach(prerequisite => {
            const reElement = actualPensum.courses[prerequisite].element;
            reElement.classList.add("prereq", "sel-act");
            ctx.moveTo(element.left[0], element.left[1]);
            ctx.lineTo(element.left[0] - actualPensum.em, element.left[1]);
            ctx.lineTo(element.left[0] - actualPensum.em, reElement.right[1]);
            ctx.lineTo(reElement.right[0], reElement.right[1]);
            ctx.stroke();
        });
        course.required.forEach(req => {
            const reElement = actualPensum.courses[req].element;
            reElement.classList.add("required", "sel-act");
            ctx.moveTo(element.right[0], element.right[1]);
            ctx.lineTo(element.right[0] + actualPensum.em, element.right[1]);
            ctx.lineTo(element.right[0] + actualPensum.em, reElement.left[1]);
            ctx.lineTo(reElement.left[0], reElement.left[1]);

            ctx.stroke();
        });
    } else if (course.available) {
        course.availableNext = false;
        if (course.passed) {
            course.passed = false;
            actualPensum.actualCredits -= course.credits;
        } else {
            course.passed = true;
            actualPensum.actualCredits += course.credits;
        }
        if (actualPensum.selectionMode == 1) {
            // Path Mode
            pathCourseCalc(course);
        } else if (actualPensum.selectionMode == 2) {
            // View Mode
            viewCourseCalc(course);
        }
    }

    updateCourse(element, index);
    return [element, index];
};

const infoAction = index => {
    const infoOld = document.querySelector(".infoBanner");
    if (infoOld) infoOld.remove();

    const course = actualPensum.courses[index];
    const info = document.createElement("div");
    info.classList.add("infoBanner", "banner");
    info.addEventListener("click", e => (e.target == info ? info.remove() : null));

    const cont = document.createElement("div");

    const nav = document.createElement("nav");
    const img = document.createElement("img");
    img.src = "/icons/arrow_back.svg";
    img.addEventListener("click", e => info.remove());
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
        img.addEventListener("click", e => {
            extendInfo.classList.toggle("show");
        });

        const hours = document.createElement("p");
        hours.textContent = `Horas: ${course.hours.reduce((i, act) => i + act, 0)}`;

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
        const preCourses = course.prerequisites.map(a => actualPensum.courses[a]);
        const ul = document.createElement("ul");
        preCourses.forEach(pre => {
            const li = document.createElement("li");
            li.textContent = pre.name;
            li.addEventListener("click", e => infoAction(actualPensum.courses.indexOf(pre)));
            ul.appendChild(li);
        });
        cont.appendChild(ul);
    }

    if (course.corequisites.length) {
        const h4 = document.createElement("h4");
        h4.textContent = "Corequisitos";
        cont.appendChild(h4);
        const coCourses = course.corequisites.map(a => actualPensum.courses[a]);
        const ul = document.createElement("ul");
        coCourses.forEach(co => {
            const li = document.createElement("li");
            li.textContent = co.name;
            li.addEventListener("click", e => infoAction(actualPensum.courses.indexOf(co)));
            ul.appendChild(li);
        });
        cont.appendChild(ul);
    }
    info.appendChild(cont);
    document.body.appendChild(info);
};

const drawCourseBanner = (newCourse, submitAction) => {
    term = newCourse.term;
    const Old = document.querySelector(".banner");
    if (Old) infoOld.remove();
    const addBanner = document.createElement("div");
    addBanner.classList.add("addBanner", "banner");
    addBanner.addEventListener("click", e => (e.target == addBanner ? addBanner.remove() : null));
    const cont = document.createElement("div");
    const form = document.createElement("form");
    form.classList.add("courseForm");

    const fields = [
        {
            label: "Código",
            name: "code",
            type: "text",
            placeholder: "Código del Curso",
            value: newCourse.code,
        },
        {
            label: "name",
            name: "name",
            type: "text",
            placeholder: "Nombre del Curso",
            value: newCourse.name,
        },
        {
            label: "Créditos",
            name: "credits",
            type: "number",
            placeholder: "Créditos del Curso",
            min: 0,
            value: newCourse.credits,
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
            value: newCourse.description,
        },
        {
            label: "Créditos Requeridos",
            name: "careerRequirementCredits",
            type: "number",
            placeholder: "Créditos Requeridos",
            value: newCourse.careerRequirement[0],
            min: 0,
            subType: true,
        },
        {
            label: "Termino Requerido",
            name: "careerRequirementTerm",
            type: "number",
            placeholder: "Termino Requerido",
            value: newCourse.careerRequirement[1],
            min: 0,
        },
    ];
    const hoursFilds = [
        {
            label: "Teoría",
            name: "hoursTheory",
            type: "number",
            placeholder: "Horas de Teoría",
            value: newCourse.hours[0],
            min: 0,
        },
        {
            label: "Práctica",
            name: "hoursPractice",
            type: "number",
            placeholder: "Horas de Práctica",
            value: newCourse.hours[1],
            min: 0,
            subType: true,
        },
        {
            label: "Laboratorio",
            name: "hoursLab",
            type: "number",
            placeholder: "Horas de Laboratorio",
            value: newCourse.hours[2],
            min: 0,
            subType: true,
        },
    ];

    const appendField = field => {
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
        if (field.value != undefined) input.value = field.value;
        if (field.min != undefined) input.setAttribute("min", field.min);

        div.appendChild(label);
        div.appendChild(input);
        return div;
    };

    fields.forEach(field => {
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
        pre.addEventListener("click", e => {
            e.preventDefault();
            selectMode = 0;
            pre.classList.add("preSelected");
            co.classList.remove("coSelected");
        });
        co.addEventListener("click", e => {
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

        const drawRequisitesTable = a => {
            ul.innerHTML = "";
            actualPensum.courses
                .filter(course => course.term < parseInt(form.term.value))
                .forEach(course => {
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

                    li.addEventListener("click", e => {
                        [relation, otherRelation, requiredRelation] =
                            selectMode === 0 ? ["prerequisites", "corequisites", "required"] : ["corequisites", "prerequisites", "corequisites"];

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
    form.addEventListener("submit", e => {
        e.preventDefault();
        if (!submitAction(newCourse, form, addBanner)) return;
        addBanner.remove();
    });

    cont.appendChild(form);
    addBanner.appendChild(cont);
    document.body.appendChild(addBanner);
};

const highlightField = (fromFields, condition = true) => {
    if (condition) {
        fromFields.classList.add("needed");
        fromFields.scrollIntoView({behavior: "smooth", block: "center"});
        return true;
    } else fromFields.classList.remove("needed");
    return false;
};

const addCourseAction = (term = actualPensum.terms) => {
    const newCourse = structuredClone(courseFormat);
    newCourse.required = [];
    newCourse.term = term;
    const submitAction = (newCourse, form) => {
        let existingCourse = false;
        if (form.code.value) existingCourse = actualPensum.courses.find(course => course.code === form.code.value);

        if (highlightField(form.name, existingCourse || form.name.value == "")) return false;
        if (highlightField(form.term, form.term.value > actualPensum.terms)) return false;

        newCourse.code = form.code.value;
        newCourse.name = form.name.value;
        newCourse.credits = parseInt(form.credits.value);
        newCourse.term = parseInt(form.term.value);
        newCourse.description = form.description.value;
        newCourse.careerRequirement = [parseInt(form.careerRequirementCredits.value), parseInt(form.careerRequirementTerm.value)];
        newCourse.hours[0] = parseInt(form.hoursTheory.value);
        newCourse.hours[1] = parseInt(form.hoursPractice.value);
        newCourse.hours[2] = parseInt(form.hoursLab.value);

        newCourse.available = false;

        actualPensum.addCourse(newCourse);
        drawPensumTable(actualPensum);
        return true;
    };
    drawCourseBanner(newCourse, submitAction);
};

const editCourseAction = newCourse => {
    // newCourse.term = term
    const submitAction = (newCourse, form) => {
        if (highlightField(form.name, form.name.value == "")) return false;

        newCourse.code = form.code.value;
        newCourse.name = form.name.value;
        newCourse.credits = parseInt(form.credits.value);
        newCourse.term = parseInt(form.term.value);
        newCourse.description = form.description.value;
        newCourse.careerRequirement = [parseInt(form.careerRequirementCredits.value), parseInt(form.careerRequirementTerm.value)];
        newCourse.hours[0] = parseInt(form.hoursTheory.value);
        newCourse.hours[1] = parseInt(form.hoursPractice.value);
        newCourse.hours[2] = parseInt(form.hoursLab.value);

        newCourse.available = false;

        // actualPensum.addCourse(newCourse);
        console.log(newCourse);
        drawPensumTable(actualPensum);
        return true;
    };
    drawCourseBanner(newCourse, submitAction);
};
const importPensum = () => {
    const importPensumAction = file => {
        const reader = new FileReader();
        reader.addEventListener("load", e => {
            drawPensumFromJson(JSON.parse(e.target.result), "imported");
        });
        reader.readAsText(file);
    };
    openAction(".json,.txt", importPensumAction);
};
const openAction = (accept, action) => {
    // <input type="file" id="archivoInput" style="display: none;" accept=".txt,.pdf,.csv"></input>
    const input = document.createElement("input");
    input.type = "file";
    input.style.display = "none";
    input.accept = accept;
    input.addEventListener("change", e => {
        action(input.files[0]);
    });
    document.body.appendChild(input);
    console.log(input);
    input.click();
    // a =input
    input.remove();
};

const openRecordAction = file => {
    const reader = new FileReader();
    reader.addEventListener("load", e => {
        // 28 is "data:application/pdf;base64,"
        const file = atob(reader.result.slice(28));

        if (typeof pdfjsLib == "undefined")
            // Error Handle (info Handle)
            drawError("Cargando pdf handler");
        else {
            pdfjsLib.GlobalWorkerOptions.workerSrc = "/JS/pdf.worker.mjs";
            extractText(file).then(text => {
                readRecord(text);
            });
        }
    });
    reader.readAsDataURL(file);
};

const importRecord = () => {
    const Old = document.querySelector(".banner");
    if (Old) Old.remove();
    const importBanner = document.createElement("div");
    importBanner.classList.add("importBanner", "banner");
    importBanner.addEventListener("click", e => (e.target == importBanner ? importBanner.remove() : null));
    const cont = document.createElement("div");
    const h3 = document.createElement("h3");
    h3.textContent = "Importar PDF del Record Académico";
    cont.appendChild(h3);

    const box = document.createElement("div");
    box.classList.add("box");

    const h4 = document.createElement("h4");
    h4.textContent = "Abrir Record";
    const p = document.createElement("p");
    p.textContent = "o Suelta el PDF";
    box.appendChild(h4);
    box.appendChild(p);
    box.addEventListener("click", e => {
        openAction(".pdf", openRecordAction);
        document.querySelector(".importBanner").remove();
    });

    cont.appendChild(box);
    importBanner.appendChild(cont);
    document.body.appendChild(importBanner);
    ["dragenter", "dragover", "dragleave"].forEach(eventName => {
        importBanner.addEventListener(
            eventName,
            e => {
                e.preventDefault();
                e.stopPropagation();
            },
            false
        );
    });
    importBanner.addEventListener("drop", ev => {
        ev.preventDefault();
        ev.stopPropagation();
        const files = [...ev.dataTransfer.items].filter(e => e.kind == "file" && e.type == "application/pdf").map(file => file.getAsFile());
        if (files.length) {
            // multiple file handle
            openRecordAction(files[0]);
            importBanner.remove();
        } else {
            // Error Handle
            drawError("Debe ser un archivo pdf");
        }
    });
};

const extractText = pdfUrl => {
    let pdf = pdfjsLib.getDocument({data: pdfUrl});
    return pdf.promise.then(pdf => {
        const totalPageCount = pdf.numPages;
        let countPromises = [];
        for (let currentPage = 1; currentPage <= totalPageCount; currentPage++) {
            let page = pdf.getPage(currentPage);
            countPromises.push(
                page.then(page => {
                    let textContent = page.getTextContent();
                    return textContent.then(text => {
                        return text.items.map(s => s.str).join("");
                    });
                })
            );
        }

        return Promise.all(countPromises).then(function (texts) {
            return texts.join("");
        });
    });
};

// UNEFA
const readRecord = texto => {
    if (!texto.includes("UNIVERSIDAD NACIONAL EXPERIMENTALPOLITÉCNICA DE LA FUERZA ARMADA NACIONAL BOLIVARIANAU.N.E.F.ANÚCLEO")) {
        console.log("Record academico no valido...");
        return 0;
    }
    actualPensum.actualCredits = 0;
    const codes = [
        ...actualPensum.courses.map(e => {
            e.passed = false;
            e.availableNext = false;
            return e.code;
        }),
    ];

    let contenido = [];
    contenido = texto.split(new RegExp("[0-9PIV]-[0-9]{4} "));
    contenido.shift(); // Delete header
    contenido = contenido.filter(e => !e.includes("CINU") && !e.includes("REPROBÓ"));

    contenido.forEach((e, i) => {
        // I dont know if realy necessary... but
        if (e.includes("Índice")) e = e.substr(0, e.indexOf("Índice"));
        if (e.includes("REPARACIÓN")) e = e.substr(0, e.indexOf("REPARACIÓN"));
        if (e.includes("- VA")) e = e.substr(0, e.indexOf("- VA"));

        let courseRecord = e
            .split(new RegExp("^(0[0-9])+? | [A-Z ÁÉÍÓÚÑ(),]{4,} "))
            .filter(e => e != undefined && e != "")
            .slice(0, 3);
        // courseRecord.forEach(console.log)
        // ["term", "code", "Calif. U.C Puntos"
        // Calif. x U.C = Puntos

        // Assingment

        if (courseRecord[2][0] != "0") {
            for (let h = 0; h < codes.length; h++) {
                const g = codes[h];
                if (g != "") {
                    if (courseRecord[1] == g) {
                        actualPensum.actualCredits += actualPensum.courses[h].credits;
                        actualPensum.courses[h].passed = true;
                        actualPensum.courses[h].available = true;
                        actualPensum.courses[h].readonly = true;
                        break;
                    }
                } else if (e.includes("ELECTIVA")) {
                    let broken = false;
                    for (let i = 0; i < actualPensum.coursesByTerm[courseRecord[0] - 1].length; i++) {
                        const w = actualPensum.coursesByTerm[courseRecord[0] - 1][i];

                        if (actualPensum.courses[w].name.includes("Electiva No") && e.includes("A NO")) {
                            actualPensum.courses[w].passed = true;
                            actualPensum.courses[w].available = true;
                            actualPensum.courses[w].readonly = true;
                            actualPensum.actualCredits += actualPensum.courses[w].credits;
                            broken = true;
                            break;
                        } else if (actualPensum.courses[w].name.includes("Electiva T") && e.includes("A TE")) {
                            actualPensum.courses[w].passed = true;
                            actualPensum.courses[w].available = true;
                            actualPensum.courses[w].readonly = true;
                            actualPensum.actualCredits += actualPensum.courses[w].credits;
                            broken = true;
                            break;
                        }
                    }
                    if (broken) break;
                }
            }
        }
    });
    const notReadOnlyCourses = actualPensum.courses.filter(course => course.readonly);
    notReadOnlyCourses.forEach(viewCourseCalc);
    drawPensumTable(actualPensum);
    modeChange(1);
    asideUpdate();
};

// Mode change

const modeChange = mode => {
    actualPensum.selectionMode = mode;

    // Clear Selection Mode
    actualPensum.element.classList.remove("selection");
    if (actualPensum.elementSelected.length) actualPensum.elementSelected[0].classList.remove("selected");
    actualPensum.elementSelected = [];

    switch (mode) {
        case 0:
            actualPensum.element.classList.add("star");
            actualPensum.element.classList.remove("view", "path");
            break;
        case 1:
            actualPensum.element.classList.add("path");
            actualPensum.element.classList.remove("view", "star");
            break;
        case 2:
            actualPensum.element.classList.add("view");
            actualPensum.element.classList.remove("path", "star");
            break;
        default:
            break;
    }

    // Clear Canvas
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    asideUpdate();
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

// Error handler

const drawError = errorMsj => {
    // error only replace errors
    const Old = document.querySelector(".errorBanner");
    if (Old) Old.remove();
    const errorBanner = document.createElement("div");
    errorBanner.classList.add("errorBanner", "banner");
    errorBanner.addEventListener("click", e => (e.target == errorBanner ? errorBanner.remove() : null));
    const cont = document.createElement("div");
    const h3 = document.createElement("h3");
    h3.textContent = "Error";
    const p = document.createElement("p");
    p.textContent = errorMsj;
    cont.appendChild(h3);
    cont.appendChild(p);
    errorBanner.appendChild(cont);
    document.body.appendChild(errorBanner);
    console.log(errorMsj);
};

const editCreate = async () => {
    const response = await fetch("/create.html");
    if (response.ok) {
        const newContent = await response.text();

        // Extract response
        const parser = new DOMParser();
        const doc = parser.parseFromString(newContent, "text/html");

        doc.querySelector("nav").remove();
        doc.querySelector("div.form.term").remove();

        const submit = doc.querySelector("div.form.submit");
        submit.innerHTML = "";
        const buttonClear = document.createElement("button");
        buttonClear.id = "clear";
        const labelClear = document.createElement("label");
        labelClear.textContent = "Limpiar";
        labelClear.type = "reset";
        buttonClear.appendChild(labelClear);
        submit.appendChild(buttonClear);

        const buttonEdit = document.createElement("button");
        buttonEdit.id = "edit";
        const labelEdit = document.createElement("label");
        labelEdit.textContent = "Guardar";
        const imgEdit = document.createElement("img");
        imgEdit.src = "/icons/save.svg";
        buttonEdit.appendChild(imgEdit);
        buttonEdit.appendChild(labelEdit);
        submit.appendChild(buttonEdit);

        // Replace the content
        const main = document.querySelector("main");
        main.innerHTML = doc.querySelector("main").innerHTML;
        main.classList.add("show");

        document.querySelector("form div.form input#career").value = actualPensum.career;
        document.querySelector("form div.form input#faculty").value = actualPensum.faculty;
        document.querySelector("form div.form textarea#description").value = actualPensum.description;
        document.querySelector("form div.form select#termName").value = actualPensum.termName.join();
        formEdit();
    } else {
        drawError("Failed to load the page.");
    }
};
