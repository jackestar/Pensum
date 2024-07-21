function materia(nombre, codigo, unid, semest, horas, prelacion = [0]) {
  this.nombre = nombre;
  this.codigo = codigo;
  this.unid = unid;
  this.semest = semest;
  this.horas = horas;
  this.prelac = prelacion;
}
// let erase
let documento = "",
  bann = document.querySelector("section.bann"),
  asideOpt = bann.querySelectorAll("section.bann>div");

let table = {
  smain: document.querySelector("section.main"),
  objeto: document.querySelector("section.main>article.scheme"),
  info: document.querySelector("aside.content"),
  condProfecinal: true,
  Materias: [],
  MateriasSemestres: [],
  Carrera: "",
  Semestres: 0,
  unidCrditTot: 0,
  materiaSelected: undefined,
  loaded: false, // Imported Record
  unidCrdit: 0, // Actuales
  getData(carrera = 0) {
    // Default Electronica
    // Consulta a la Base de datos...
    this.condProfecinal = true;
    this.Carrera = "Ingenieria Electronica";
    this.Semestres = 9;
    this.unidCrditTot = 228;
    this.Materias = [
      new materia("Educacion Ambiental", "ADG-25132", 2, 1, [2, 1, 0]),
      new materia("SoCiTec", "ADG-25123", 3, 1, [2, 2, 0]),
      new materia("Ingles I", "IDM-24113", 3, 1, [2, 2, 0]),
      new materia("Dibujo", "MAT-21212", 2, 1, [1, 3, 0]),
      new materia("Matematica I", "MAT-21215", 5, 1, [4, 2, 0], [[5, true]]),
      new materia(
        "Geometria Analitica",
        "MAT-21524",
        4,
        1,
        [3, 2, 0],
        [[4, true]]
      ),
      new materia("Seminario I", "ADG-25131", 1, 1, [1, 0, 0]),
      new materia("Defensa I", "DIN-21113", 3, 1, [2, 2, 0]),

      new materia("Ingles II", "IDM-24123", 3, 2, [2, 2, 0], [[2, false]]),
      new materia("Quimica General", "QUF-22014", 4, 2, [2, 2, 3]),
      new materia(
        "Fisica I",
        "QUF-23015",
        5,
        2,
        [4, 2, 2],
        [
          [4, false],
          [5, false],
        ]
      ),
      new materia(
        "Matematica II",
        "MAT-21225",
        5,
        2,
        [4, 2, 0],
        [
          [4, false],
          [5, false],
        ]
      ),
      new materia(
        "Algebra Lineal",
        "MAT-21114",
        4,
        2,
        [2, 4, 0],
        [
          [4, false],
          [5, false],
        ]
      ),
      new materia("Seminario II", "ADG-25141", 1, 2, [1, 0, 0], [[6, false]]),
      new materia("Defensa II", "DIN-21123", 3, 2, [2, 2, 0], [[7, false]]),

      new materia(
        "Fisica II",
        "QUF-23025",
        5,
        3,
        [4, 2, 2],
        [
          [10, false],
          [11, false],
        ]
      ),
      new materia(
        "Matematica III",
        "MAT-21235",
        5,
        3,
        [4, 2, 0],
        [[11, false]]
      ),
      new materia(
        "Probabilidad y Estadistica",
        "MAT-21414",
        4,
        3,
        [2, 4, 0],
        [[11, false]]
      ),
      new materia("Programacion", "SYC-22113", 3, 3, [2, 0, 3], [[12, false]]),
      new materia(
        "Transformadas Integrales",
        "MAT-20254",
        4,
        3,
        [3, 3, 0],
        [
          [12, false],
          [16, true],
        ]
      ),
      new materia("Defensa III", "DIN-21133", 3, 3, [2, 2, 0], [[14, false]]),

      new materia(
        "Redes Electricas I",
        "ELC-30114",
        4,
        4,
        [3, 2, 0],
        [
          [19, false],
          [15, false],
        ]
      ),
      new materia(
        "Fisica III",
        "QUF-33035",
        5,
        4,
        [3, 2, 3],
        [
          [16, false],
          [15, false],
        ]
      ),
      new materia(
        "Senales y Sistemas Dinamicos",
        "ELN-33154",
        4,
        4,
        [3, 3, 0],
        [[19, false]]
      ),
      new materia(
        "Mediciones Electricas",
        "ELC-30215",
        5,
        4,
        [3, 2, 3],
        [[21, true]]
      ),
      new materia(
        "Sistemas Digitales I",
        "ELN-31325",
        5,
        4,
        [3, 2, 3],
        [[21, true]]
      ),
      new materia(
        "Teoria Electromagnetica",
        "ELN-30314",
        4,
        4,
        [3, 2, 0],
        [
          [19, false],
          [15, false],
        ]
      ),
      new materia("Defensa IV", "DIN-31143", 3, 4, [2, 2, 0], [[20, false]]),

      new materia(
        "Redes Electricas II",
        "ELC-30125",
        5,
        5,
        [3, 2, 3],
        [
          [21, false],
          [24, false],
        ]
      ),
      new materia(
        "Electronica I",
        "ELN-30115",
        5,
        5,
        [3, 2, 3],
        [
          [21, false],
          [22, false],
        ]
      ),
      new materia(
        "Sistemas Digitales II",
        "ELN-31335",
        5,
        5,
        [3, 2, 3],
        [[25, false]]
      ),
      new materia(
        "Teoria de Control Automatico",
        "ELN-33155",
        5,
        5,
        [3, 2, 3],
        [[23, false]]
      ),
      new materia(
        "Programacion Orientada a Objetos",
        "ELN-34105",
        5,
        5,
        [3, 2, 3],
        [[18, false]]
      ),
      new materia("Defensa V", "DIN-31153", 3, 5, [2, 2, 0], [[27, false]]),

      new materia(
        "Conversion Electromecanica",
        "ELC-32105",
        5,
        6,
        [3, 2, 3],
        [
          [26, false],
          [28, false],
        ]
      ),
      new materia(
        "Instrumentacion Industrial",
        "ELN-33415",
        5,
        6,
        [4, 2, 0],
        [
          [28, false],
          [38, true],
        ]
      ),
      new materia(
        "Control de Procesos",
        "ELN-33205",
        5,
        6,
        [4, 2, 2],
        [[35, true]]
      ),
      new materia(
        "Microprocesadores",
        "ELN-31415",
        5,
        6,
        [3, 2, 3],
        [[30, false]]
      ),
      new materia(
        "Electronica II",
        "ELN-30125",
        5,
        6,
        [4, 2, 2],
        [[29, false]]
      ),
      new materia(
        "Marco Legal Para El Ejercicion De La Ingenieria",
        "CJU-37314",
        4,
        6,
        [4, 0, 0],
        58
      ),
      new materia("Defensa VI", "DIN-31163", 3, 6, [2, 0, 0], [[33, false]]),

      new materia(
        "Control De Motores",
        "ELC-32415",
        5,
        7,
        [3, 2, 3],
        [[34, false]]
      ),
      new materia(
        "Comunicaciones",
        "TLC-31145",
        5,
        7,
        [4, 3, 2],
        [
          [23, false],
          [29, false],
        ]
      ),
      new materia(
        "Electronica III",
        "ELN-30135",
        5,
        7,
        [4, 2, 2],
        [[34, false]]
      ),
      new materia(
        "Sistemas de Control",
        "ELN-33215",
        5,
        7,
        [4, 2, 0],
        [[36, false]]
      ),
      new materia(
        "Metodologia de la Investigacion",
        "ADG-30214",
        4,
        7,
        [3, 2, 0],
        162
      ),
      new materia("Electiva Tecnica", "", 3, 7, [3, 1, 0], 162),
      new materia("Electiva No Tecnica", "", 3, 7, [3, 0, 0], 162),
      new materia("Defensa VII", "DIN-31173", 3, 7, [2, 2, 0], [[40, false]]),

      new materia(
        "Automatizacion Y Control Industrial",
        "ELN-33324",
        4,
        8,
        [3, 2, 2],
        [[44, false]]
      ),
      new materia(
        "Electronica Industrial",
        "ELN-31315",
        5,
        8,
        [4, 2, 2],
        [[34, false]]
      ),
      new materia(
        "Mantenimiento General",
        "AGM-30314",
        4,
        8,
        [4, 1, 0],
        [
          [44, false],
          [41, true],
        ]
      ),
      new materia(
        "Seminarion de Control",
        "ELN-33301",
        1,
        8,
        [0, 2, 0],
        [[44, false]]
      ),
      new materia("Electiva Tecnica", "", 3, 8, [3, 1, 0], 195),
      new materia("Electiva No Tecnica", "", 3, 8, [3, 0, 0], 195),
      new materia("Defensa VIII", "DIN-31183", 3, 8, [2, 2, 0], [[48, false]]),

      new materia("TEG", "", 10, 9, [0, 0, 0], 218),
    ];
    this.MateriasSemestres.length = this.Semestres;
    this.MateriasSemestres.fill(Array());
    this.Materias.forEach((e, i) => {
      let t = this.MateriasSemestres[e.semest - 1].slice();
      t.push(i);
      this.MateriasSemestres[e.semest - 1] = t.slice();
      e.Aprobed = false;
      e.avaible = true;
    });
  },
  Generate() {
    // clear the inner
    this.objeto.innerHTML = "";
    let selSem = 0,
      tempString = ""; //template

    this.MateriasSemestres.forEach((s, i) => {
      //All aviable by default
      s.forEach((m) => {
        this.Materias[m].avaible = true;
        this.Materias[m].coprel = false;
        this.Materias[m].dep = false;
      });

      s.forEach((m) => {
        let e = this.Materias[m]; // e Select Materia
        aproach = (status = false) => {
          // Aprobed or Clear fn
          if (status) e.avaible = true;
          else if (!(this.loaded && e.Aprobed)) {
            // Clear UC
            if (e.Aprobed) this.unidCrdit -= e.unid;
            e.avaible = false;
            e.Aprobed = false;
            // e.road = false;
          }
        };
        if (e.prelac == 0) e.avaible = true; // Sin prelacion
        else if (typeof e.prelac == "object") {
          // Prelacion materias
          // for (let x = 0; x < 2; x++) {
          e.prelac.forEach((p) => {
            if (this.Materias[p[0]].avaible) {
              e.road = true;
              if (this.Materias[p[0]].Aprobed) {
                // e.coprel = false
              } else if (p[1]) {
                if (e.Aprobed) this.Materias[p[0]].dep = true;
                else {
                  e.coprel = true;
                  this.Materias[p[0]].dep = false;
                }
              } else aproach();
            } else {
                e.road = false;
                aproach()
            };
          });
          // }
          // Prelacion UC
        } else if (
          this.unidCrdit >= e.prelac &&
          this.MateriasSemestres.every((y) =>
            y.every(
              (x) =>
                this.Materias[x].semest >= i + 1 ||
                (this.Materias[x].semest < i + 1 && this.Materias[x].Aprobed)
            )
          )
        ) {
          if (e.Aprobed) aproach(this.unidCrdit - e.unid >= e.prelac);
          else aproach(true);
        } else aproach();
      });
    });

    //Generate
    this.MateriasSemestres.forEach((s, i) => {
      tempString += `<ul ${
        i > 2 &&
        this.condProfecinal &&
        !this.MateriasSemestres[3].every((x) => this.Materias[x].avaible)
          ? "class='locked'"
          : ""
      }>
                                <li class='sem' onclick='table.pass(${i + 1})'>
                                <h3>Semestre ${i + 1}</h3>
                                </li>`;
      s.forEach((m) => {
        let e = this.Materias[m];
        let clases = "";

        if (e.avaible) {
          if (e.Aprobed) clases += "aprobed ";
          else {
            clases += "aviable ";
            if (e.coprel) clases += "copre ";
            else if (e.dep) clases += "dep";
          }
        } else if (e.road) clases += "road ";

        tempString += `<li class='${clases}' onclick='${
          e.avaible ? `table.update(${m})` : `table.infor(${m})`
        }'>
                                    <h3>${e.nombre}</h3>
                                    <p>${e.codigo}</p>
                                    </li>`;
      });
      tempString += "</ul>";
    });

    this.objeto.innerHTML = tempString;

    // let posicion = 0
    // gen...
  },
  update(materia) {
    this.loaded = false;
    // la asignacion retorna el valor asignado
    if ((this.Materias[materia].Aprobed = !this.Materias[materia].Aprobed))
      this.unidCrdit += this.Materias[materia].unid;
    else this.unidCrdit -= this.Materias[materia].unid;
    this.Generate();
    this.infor(materia);
  },
  pass(Semestre) {
    this.loaded = false;
    let comp = true;
    if (
      this.MateriasSemestres[Semestre - 1].every(
        (e) => this.Materias[e].Aprobed || !this.Materias[e].avaible
      )
    ) {
      this.MateriasSemestres[Semestre - 1].forEach((e) => {
        if (this.Materias[e].avaible) this.unidCrdit -= this.Materias[e].unid;
        this.Materias[e].Aprobed = false;
      });
    } else {
      this.MateriasSemestres[Semestre - 1].forEach((e) => {
        if (!this.Materias[e].Aprobed) {
          this.Materias[e].Aprobed = true;
          this.unidCrdit += this.Materias[e].unid;
        }
      });
    }
    this.Generate();
  },
  infor(materia = this.materiaSelected) {
    this.info.innerHTML = "";
    let tempString = "<div class='";
    if (this.Materias[materia].avaible) {
      if (this.Materias[materia].Aprobed) tempString += "aprobed ";
      else tempString += "aviable ";
    }
    if (this.Materias[materia].coprel) tempString += "copre ";
    else if (this.Materias[materia].dep) tempString += "dep ";
    tempString += `'>
            <h3>${this.Materias[materia].nombre}</h3>
            <i>${this.Materias[materia].codigo}</i>
            <i>UC: ${this.Materias[materia].unid}</i></div>`;
    let totHors = 0;
    this.Materias[materia].horas.forEach((e) => (totHors += e));
    if (totHors != 0) {
      tempString += `<h4>HORAS: <b> ${totHors} </b></h4><ul class='hours'>`;
      for (let i = 0; i < this.Materias[materia].horas[0]; i++)
        tempString += `<li class='t'>${
          i == 0 ? this.Materias[materia].horas[0] + "T" : ""
        }</li>`;
      for (let i = 0; i < this.Materias[materia].horas[1]; i++)
        tempString += `<li class='p'>${
          i == 0 ? this.Materias[materia].horas[1] + "P" : ""
        }</li>`;
      for (let i = 0; i < this.Materias[materia].horas[2]; i++)
        tempString += `<li class='l'>${
          i == 0 ? this.Materias[materia].horas[2] + "L" : ""
        }</li>`;
      tempString += "</ul>";
    }
    let tempcop = "",
      temppre = "";
    if (this.Materias[materia].prelac != 0) {
      if (typeof this.Materias[materia].prelac == "number")
        temppre += `<i>Unidades de Credito: ${this.Materias[materia].prelac}</i><br><i>Unidades de Credito Actuales: ${this.unidCrdit}</i>`;
      else
        this.Materias[materia].prelac.forEach((e) => {
          let temp = "<li class='";
          if (this.Materias[e[0]].avaible) {
            if (this.Materias[e[0]].Aprobed) temp += "aprobed ";
            else temp += "aviable ";
          }

          if (this.Materias[e[0]].coprel) temp += "copre ";
          else if (this.Materias[e[0]].dep) temp += "dep ";
          temp += `'><p>${this.Materias[e[0]].nombre}</p><i>${
            this.Materias[e[0]].codigo
          }</i></li>`;
          if (e[1]) tempcop += temp;
          else temppre += temp;
        });
      // REV...
      if (temppre != "")
        tempString += "<b>Prelaciones</b><ul class='list'>" + temppre + "</ul>";
      if (tempcop != "")
        tempString +=
          "<b>Co-Prelaciones</b><ul class='list'>" + tempcop + "</ul>";
    }
    this.info.innerHTML =
      tempString + `<i class="back" onclick="table.infoT()">→</i>`;
    if (
      this.materiaSelected == undefined ||
      (!this.Materias[materia].avaible && this.materiaSelected == materia) ||
      this.info.classList.contains("hide")
    )
      this.infoT();
    this.materiaSelected = materia;
  },
  infoT() {
    this.info.classList.toggle("hide");
    this.smain.classList.toggle("hide");
  },
  ReadRecord(texto) {
    // console.log(texto);
    this.unidCrdit = 0;
    if (!texto.includes("REPÚBLICA BOLIVARIANA DE VENEZUELAMINISTERIO DEL PODER POPULAR PARA LA DEFENSAVICEMINISTERIO DE EDUCACIÓN PARA LA DEFENSAUNIVERSIDAD NACIONAL EXPERIMENTALPOLITÉCNICA DE LA FUERZA ARMADA NACIONAL BOLIVARIANAU.N.E.F.ANÚCLEO")) {
      alert("Record academico no valido...");
      return 0;
    }
    let codigos = Array();
    //default
    this.Materias.forEach((e) => {
      codigos.push(e.codigo);
      e.Aprobed = false;
    });
    let contenido = "";
    contenido = texto.split(new RegExp("[0-9PIV]-[0-9]{4} "));
    contenido.shift(); // Delete header
    contenido = contenido.filter((e) => {
      return !e.includes("APROBÓ") && !e.includes("REPROBÓ");
    });
    contenido.forEach((e, i) => {
      // I dont know if realy necessary... but
      if (e.includes("Índice")) e = e.substr(0, e.indexOf("Índice"));
      if (e.includes("REPARACIÓN")) e = e.substr(0, e.indexOf("REPARACIÓN"));

      let nova = e
        .split(new RegExp("^(0[0-9])+? | [A-Z ÁÉÍÓÚÑ(),]{4,} "))
        .filter((e) => {
          return e != undefined && e != "";
        });

      if (nova[2][0] != "0") {
        for (let h = 0; h < codigos.length; h++) {
          const g = codigos[h];
          if (g != "") {
            if (nova[1] == g) {
              this.unidCrdit += this.Materias[h].unid;
              this.Materias[h].Aprobed = true;
              break;
            }
          } else if (e.includes("ELECTIVA")) {
            let broken = false;
            for (
              let i = 0;
              i < this.MateriasSemestres[nova[0] - 1].length;
              i++
            ) {
              const w = this.MateriasSemestres[nova[0] - 1][i];

              if (
                this.Materias[w].nombre.includes("Electiva No") &&
                e.includes("A NO")
              ) {
                this.Materias[w].Aprobed = true;
                this.unidCrdit += this.Materias[w].unid;
                broken = true;
                break;
              } else if (
                this.Materias[w].nombre.includes("Electiva T") &&
                e.includes("A TE")
              ) {
                this.Materias[w].Aprobed = true;
                this.unidCrdit += this.Materias[w].unid;
                broken = true;
                break;
              }
            }
            if (broken) break;
          }
        }
      }
    });
    // erase = texto
    this.loaded = true;
    if (this.materiaSelected != undefined) {
      this.infor();
      this.infoT();
    }
    this.Generate();
    document.querySelector("div.blk").classList.remove("look");
  },
};

table.getData();
table.Generate();
let open = false;
asideOpt.forEach((e) => {
  e.querySelector(".icon").addEventListener("click", () => {
    bann.classList.add("lk");
    if (open) {
      asideOpt.forEach((i) => {
        if (i != e) i.classList.remove("look");
        else e.classList.add("look");
      });
    } else {
      open = true;
      e.classList.add("look");
      document.querySelector("div.blk").classList.add("look");
    }
  });
});
let axit = (ulook = true) => {
    asideOpt.forEach((e) => {
      bann.classList.remove("lk");
      e.classList.remove("look");
    });
    if (ulook) document.querySelector("div.blk").classList.remove("look");
    open = false;
  },
  carga = (ev) => {
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
    document.querySelector("div.blk").classList.add("look");
    let file;

    if (ev.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      [...ev.dataTransfer.items].forEach((item, i) => {
        // If dropped items aren't files, reject them
        if (item.kind === "file") {
          file = item.getAsFile();
        }
      });
    } else {
      // Use DataTransfer interface to access the file(s)
      [...ev.dataTransfer.files].forEach((filex, i) => {
        file = file;
      });
    }
    const reader = new FileReader();
    // const id = 'Record'
    reader.addEventListener("load", (e) => {
      documento = reader.result;
      evoke();
      axit(false);
    });
    reader.readAsDataURL(file);
    documento = file.webkitRelativePath + file.name;
  },
  page = (objeto) => {
    let n = undefined,
      m = document.querySelectorAll(".hcont div.pag"),
      chil = objeto.parentElement.children;
    for (let i = 0; i < chil.length; i++) {
      if (chil[i] == objeto) n = i;
      else {
        chil[i].classList.remove("sel");
        m[i].classList.remove("sel");
      }
    }
    m.forEach((e, i) => {
      if (i == n) {
        e.classList.add("sel");
        chil[i].classList.add("sel");
        if (i == 1) {
          let dem = () => {
            e.querySelectorAll("li")[1].classList.add("aprobed");
            setTimeout(() => {
              e.querySelectorAll("ul")[1].classList.remove("locked");
              e.querySelectorAll("li")[1].classList.add("aprobed");
              e.querySelectorAll("li")[2].classList.add("aprobed");
              e.querySelectorAll("li")[4].classList.add("aviable");
              setTimeout(() => {
                e.querySelectorAll("li")[4].classList.add("aprobed");
                setTimeout(() => {
                  e.querySelectorAll("ul")[1].classList.add("locked");
                  e.querySelectorAll("li")[1].classList.remove("aprobed");
                  e.querySelectorAll("li")[2].classList.remove("aprobed");
                  e.querySelectorAll("li")[4].classList.remove("aprobed");
                }, 1000);
              }, 1000);
            }, 1000);
          };
          dem();
          demo = setInterval(() => dem(), 4100);
        } else {
          clearInterval(demo);
        }
      }
    });
  };

document.querySelector("input.file").addEventListener("change", (ev) => {
  document.querySelector("div.blk").classList.add("look");
  let file = ev.target.files[0];
  const reader = new FileReader();
  const id = "Record";
  reader.addEventListener("load", (e) => {
    documento = reader.result;
    evoke();
    axit(false);
  });
  reader.readAsDataURL(file);
});
let demo = 0;
let inputFile = document.querySelector(".upl input.file");

// PDF extractor

let extractText = (pdfUrl) => {
  var pdf = pdfjsLib.getDocument({ data: pdfUrl });
  return pdf.promise.then(function (pdf) {
    var totalPageCount = pdf.numPages;
    var countPromises = [];
    for (var currentPage = 1; currentPage <= totalPageCount; currentPage++) {
      var page = pdf.getPage(currentPage);
      countPromises.push(
        page.then(page => {
          var textContent = page.getTextContent();
          return textContent.then(function (text) {
            return text.items
              .map(s => {
                return s.str;
              })
              .join("");
          });
        })
      );
    }

    return Promise.all(countPromises).then(function (texts) {
      return texts.join("");
    });
  });
};

let evoke = () => {
  bann.classList.remove("lk");
  let url = atob(documento.slice(documento.indexOf("base") + 7));
  pdfjsLib.GlobalWorkerOptions.workerSrc = "./pdfjs-st/pdf.worker.js";
  extractText(url).then(text => {
    table.ReadRecord(text);
  });
};
