'use strict';

function calculateMatiereAverage(modules, matiereModules) {
    let sommeNotes = 0;
    let count = 0;
    
    matiereModules.forEach(moduleId => {
        const note = parseFloat(document.getElementById(moduleId).value);
        if (!isNaN(note)) {
            sommeNotes += note;
            count++;
        }
    });
    
    return count > 0 ? sommeNotes / count : 0;
}

function groupModulesByMatiere(modules) {
    const matiereGroups = {};
    
    modules.forEach(module => {
        if (!matiereGroups[module.matiere]) {
            matiereGroups[module.matiere] = {
                modules: [],
                totalCredits: 0
            };
        }
        matiereGroups[module.matiere].modules.push(module);
        matiereGroups[module.matiere].totalCredits += module.coefficient;
    });
    
    return matiereGroups;
}

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
    let totalCreditsEarned = 0;
    let error = false;

    if (!annee || !semestre || !specialite) {
      resultat.textContent =
        "Veuillez sélectionner une année, une spécialité et un semestre.";
      return;
    }

    const modules = isetComData[annee][specialite][semestre];
    const matiereGroups = groupModulesByMatiere(modules);

    // Calculate average for each matiere and check if credits are earned
    for (const [matiere, group] of Object.entries(matiereGroups)) {
      let matiereTotal = 0;
      let matiereCoeff = 0;
      let allModulesValid = true;

      group.modules.forEach(module => {
        const noteInputId = `${annee}_${specialite}_${semestre}_${module.matiere.replace(/\s+/g, "")}_${module.module.replace(/\s+/g, "")}`;
        const note = parseFloat(document.getElementById(noteInputId).value);
        
        if (isNaN(note)) {
          resultat.textContent = `Note invalide pour le module: ${module.module}`;
          error = true;
          return;
        }

        matiereTotal += note * module.coefficient;
        matiereCoeff += module.coefficient;

        if (note < 8) { // If any module has less than 8, matiere is not validated
          allModulesValid = false;
        }
      });

      if (error) return;

      const matiereAverage = matiereTotal / matiereCoeff;
      
      // Add to global average calculation
      sommeNotesCoefficients += matiereTotal;
      sommeCoefficients += matiereCoeff;

      // Check if matiere is validated (average >= 10 and all modules >= 8)
      if (matiereAverage >= 10 && allModulesValid) {
        totalCreditsEarned += group.totalCredits;
      }
    }

    if (error) return;

    const moyenne = sommeNotesCoefficients / sommeCoefficients;
    const totalCredits = Object.values(matiereGroups).reduce((sum, group) => sum + group.totalCredits, 0);
    
    resultat.innerHTML = `
        <div class="text-center">
            <p class="text-xl mb-2">Moyenne du ${semestre} : ${moyenne.toFixed(2)}</p>
            <p class="text-lg text-gray-600">Crédits validés : ${totalCreditsEarned}/${totalCredits}</p>
        </div>
    `;

    // Add success animation
    resultat.classList.add("animate-bounce");
    setTimeout(() => resultat.classList.remove("animate-bounce"), 1000);
  }, 500);
}
