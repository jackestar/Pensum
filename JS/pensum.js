// Prototipos

// Current Version
const FormatVersion = 0;

let courseFormat = {
    code: "",
    name: "",
    credits: 0,
    semester: 0,
    description: "",
    hours: [0, 0, 0], // theory, practice, lab
    prerequisites: [], // code - prerequisites
    corequisites: [], // code - Other parallel courses
    careerRequirement: [0, 0], // credits, semester
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
    semesters: 0,
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

    pensum.courses = pensum.courses.map((course) => {
        filtered = {};
        courseKeys.forEach((key) => {
            if (course.hasOwnProperty(key)) {
                filtered[key] = course[key];
            }
        });
        return filtered;
    });
    return pensum;
};
pre = importJSON("/pensums/electronica.json");
test = filterJSON(pre);

// Element Builder

const addListElement = (name, icon, url) => {
    const div = document.createElement("div");
    div.setAttribute("data-url", url);
    div.classList.add("avaible-item");

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
    actualPensum.selectionMode = 0;
    actualPensum.elementSelected = [];
    actualPensum.element = [];
    semesters = pensum.semesters;

    let coursesBySemester = Array.from({ length: semesters }, () => []);

    actualPensum.courses.forEach((course, index) => {
        let sem = course.semester - 1;
        course.index = index;
        course.required = course.required ? course.required : [];
        if (sem) course.available = false;
        if (!course.prerequisites.length) course.available = true;
        if (course.corequisites.length) {
            course.corequisites.forEach((corequisite, index) => {
                const co = actualPensum.courses.find(
                    (c) => c.code === corequisite
                );
                co.index = actualPensum.courses.findIndex(
                    (c) => c.code === corequisite
                );
                console.log(co, co.index);
                course.corequisites[index] = co.index;
                co.corequired = true;
                actualPensum.courses[co.index] = co;
            });
        }
        if (course.prerequisites.length) {
            course.prerequisites.forEach((prerequisite, index) => {
                const pr = actualPensum.courses.find(
                    (c) => c.code === prerequisite
                );
                pr.required
                    ? pr.required.push(course.index)
                    : (pr.required = [course.index]);
                course.prerequisites[index] = pr.index;
            });
        }
        coursesBySemester[sem].push(course);
    });

    const article = document.createElement("article");
    article.classList.add("pensum");
    for (let semester = 0; semester < semesters; semester++) {
        const ul = document.createElement("ul");
        ul.classList.add("semester");
        const li = document.createElement("li");
        const p = document.createElement("p");
        p.textContent = `Semestre ${semester + 1}`;

        li.appendChild(p);
        ul.appendChild(li);

        coursesBySemester[semester].forEach((course) => {
            const li = document.createElement("li");
            li.addEventListener("click", (e) => {
                actualPensum.elementSelected = elementAction(li, course.index);
            });

            const h3 = document.createElement("h3");
            h3.textContent = course.name;
            const p = document.createElement("p");
            p.textContent = course.code;
            li.appendChild(h3);
            li.appendChild(p);
            course.element = li;
            ul.appendChild(li);
            updateCourse(li, course.index);
        });

        article.appendChild(ul);
    }
    return article;
};

updateCourse = (element, index) => {
    const course = actualPensum.courses[index];
    if (course.available) {
        element.classList.remove("unavailable");
        if (course.corequired) element.classList.add("corequired");
        else element.classList.remove("corequired");
    } else {
        element.classList.add("unavailable");
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
        course.element.classList.remove("sel-act");
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
                    ctx.lineTo(element.bottom[0], reElement.top[1] - actualPensum.em);
                    ctx.lineTo(reElement.top[0], reElement.top[1] - actualPensum.em);
                    ctx.lineTo(reElement.top[0], reElement.top[1]);
                }
            } else {
                ctx.moveTo(element.top[0], element.top[1]);
                if (element.bottom[0] == reElement.top[0])
                    ctx.lineTo(reElement.bottom[0], reElement.bottom[1]);
                else {
                    ctx.lineTo(element.bottom[0],reElement.bottom[1] + actualPensum.em);
                    ctx.lineTo(reElement.bottom[0], reElement.bottom[1]+ actualPensum.em);
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
            ctx.lineTo(reElement.right[0], reElement.right[1]
            );
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

        updateCourse(element, index);
    }
    return [element, index];
};

// Canvas Arrow

const canvas = document.querySelector("canvas.arrow");

const initCanvas = () => {
    canvas.width = actualPensum.element.scrollWidth;
    canvas.height = actualPensum.element.scrollHeight;
};
