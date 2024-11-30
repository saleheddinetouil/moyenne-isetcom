'use strict';


      

      function updateSpecialities() {
        const annee = document.getElementById("anneeSelect").value;
        const specialiteSelect = document.getElementById("specialiteSelect");
        specialiteSelect.innerHTML =
          '<option value="">--Sélectionnez--</option>';
        if (annee && isetComData[annee]) {
          const specialities = Object.keys(isetComData[annee]);
          specialities.forEach((specialite) => {
            specialiteSelect.innerHTML += `<option value="${specialite}">${specialite}</option>`;
          });
        }
        updateSemesters(); //update semesters when year changes
      }

      function updateSemesters() {
        const annee = document.getElementById("anneeSelect").value;
        const specialite = document.getElementById("specialiteSelect").value;
        const semestreSelect = document.getElementById("semestreSelect");
        semestreSelect.innerHTML = '<option value="">--Sélectionnez--</option>';
        if (
          annee &&
          specialite &&
          isetComData[annee] &&
          isetComData[annee][specialite]
        ) {
          const semestres = Object.keys(isetComData[annee][specialite]);
          semestres.forEach((semestre) => {
            semestreSelect.innerHTML += `<option value="${semestre}">${semestre}</option>`;
          });
        }
        updateModules(); //update modules when semester changes
      }

      function updateModules() {
        const modulesDiv = document.getElementById("modules");
        modulesDiv.innerHTML = "";
        const annee = document.getElementById("anneeSelect").value;
        const specialite = document.getElementById("specialiteSelect").value;
        const semestre = document.getElementById("semestreSelect").value;

        if (
          annee &&
          semestre &&
          specialite &&
          isetComData[annee] &&
          isetComData[annee][specialite] &&
          isetComData[annee][specialite][semestre]
        ) {
          const modules = isetComData[annee][specialite][semestre];
          let currentMatiere = "";
          let matiereCount = 0;
          modules.forEach((module, index) => {
            if (module.matiere !== currentMatiere) {
              currentMatiere = module.matiere;
              matiereCount++;
              modulesDiv.innerHTML += `<h3 class="font-bold text-lg mt-4">${toRoman(
                matiereCount
              )}. ${module.matiere}</h3>`;
            }
            modulesDiv.innerHTML += `
              <div class="mb-4">
                <label for="${annee}_${specialite}_${semestre}_${module.matiere.replace(
              /\s+/g,
              ""
            )}_${module.module.replace(
              /\s+/g,
              ""
            )}" class="block text-gray-700 font-bold mb-2">
                  ${index + 1}. ${module.module}
                </label>
                <input
                  id="${annee}_${specialite}_${semestre}_${module.matiere.replace(
              /\s+/g,
              ""
            )}_${module.module.replace(/\s+/g, "")}"
                  type="number"
                  step="0.25"
                  class="form-input block w-full appearance-none bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
            `;
          });
        }
      }

      function toRoman(num) {
        const lookup = {
          M: 1000,
          CM: 900,
          D: 500,
          CD: 400,
          C: 100,
          XC: 90,
          L: 50,
          XL: 40,
          X: 10,
          IX: 9,
          V: 5,
          IV: 4,
          I: 1,
        };
        let roman = "";
        for (let i in lookup) {
          while (num >= lookup[i]) {
            roman += i;
            num -= lookup[i];
          }
        }
        return roman;
      }

      function calculerMoyenne() {
        const resultat = document.getElementById("resultat");
        resultat.innerHTML =
          '<i class="fas fa-spinner loading"></i> Calcul en cours...';

        setTimeout(() => {
          const annee = document.getElementById("anneeSelect").value;
          const semestre = document.getElementById("semestreSelect").value;
          const specialite = document.getElementById("specialiteSelect").value;
          let sommeNotesCoefficients = 0;
          let sommeCoefficients = 0;
          let error = false;

          if (!annee || !semestre || !specialite) {
            document.getElementById("resultat").textContent =
              "Veuillez sélectionner une année, une spécialité et un semestre.";
            return;
          }

          const modules = isetComData[annee][specialite][semestre];

          if (!modules || modules.length === 0) {
            document.getElementById("resultat").textContent =
              "Aucun module trouvé pour cette sélection.";
            return;
          }

          modules.forEach((module) => {
            const noteInputId = `${annee}_${specialite}_${semestre}_${module.matiere.replace(
              /\s+/g,
              ""
            )}_${module.module.replace(/\s+/g, "")}`;
            const note = parseFloat(document.getElementById(noteInputId).value);
            if (isNaN(note)) {
              document.getElementById(
                "resultat"
              ).textContent = `Note invalide pour le module: ${module.module}`;
              error = true;
              return;
            }

            sommeNotesCoefficients += note * module.coefficient;
            sommeCoefficients += module.coefficient;
          });

          if (error) return;

          const moyenne = sommeNotesCoefficients / sommeCoefficients;
          document.getElementById(
            "resultat"
          ).textContent = `Moyenne du ${semestre} de la ${annee} (${specialite}) : ${moyenne.toFixed(
            2
          )}`;

          // Add success animation
          resultat.classList.add("animate-bounce");
          setTimeout(() => resultat.classList.remove("animate-bounce"), 1000);
        }, 500);
      }
