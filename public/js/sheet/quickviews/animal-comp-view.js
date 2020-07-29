/* Copyright (C) 2020, Wanderer's Guide, all rights reserved.
    By Aaron Cassar.
*/

function openAnimalCompQuickview(data) {

    let qContent = $('#quickViewContent');

    let charAnimal = data.CharAnimalComp;
    let animal = g_companionData.AllAnimalCompanions.find(animal => {
        return animal.id == charAnimal.animalCompanionID;
    });
    if(animal == null){
        qContent.append('<p class="has-text-danger is-italic">Could not find animal companion data!</p>');
        return;
    }

    // Remove Button //
    $('#quickViewTitleRight').html('<button id="removeAnimalBtn" class="button is-very-small is-danger is-outlined is-rounded is-pulled-right mr-1">Remove</button>');
    $('#removeAnimalBtn').click(function(){
        socket.emit("requestRemoveAnimalCompanion",
            getCharIDFromURL(),
            charAnimal.id);
    });

    // Name //
    qContent.append('<div class="field is-marginless mb-1"><div class="control"><input id="animalName" class="input" type="text" maxlength="90" value="'+charAnimal.name+'" placeholder="Companion Name" spellcheck="false" autocomplete="off"></div></div>');

    $("#animalName").on("input", function(){
        $('#quickViewTitle').html("Companion - "+$('#animalName').val());
    });
    $('#animalName').trigger("input");

    $('#animalName').blur(function() {
        if($('#animalName').val() != charAnimal.name){
            updateAnimalCompanion(charAnimal);
        }
    });

    // Health //
    let maxHP = getAnimalCompanionMaxHealth(charAnimal);
    let currentHP = charAnimal.currentHP;
    if(currentHP == -1){ currentHP = maxHP; }

    qContent.append('<div class="field has-addons has-addons-centered is-marginless"><p class="control"><input id="healthInput" class="input" type="number" min="0" max="'+maxHP+'" value="'+currentHP+'"></p><p class="control"><a class="button is-static has-text-grey-light has-background-grey-darkest border-darker">/</a><p class="control"><a class="button is-static has-text-grey-lighter has-background-grey-darklike border-darker">'+maxHP+'</a></p></div>');
    $('#healthInput').blur(function() {
        if($('#healthInput').val() != charAnimal.currentHP){
            updateAnimalCompanion(charAnimal);
        }
    });

    qContent.append('<hr class="mt-1 mb-2 mx-3" style="border-width: 3px;">');

    // Char Level //
    let lvl = g_character.level;

    // Ability Scores //
    let modStr = getAnimalModStr(animal, charAnimal);
    let modDex = getAnimalModDex(animal, charAnimal);
    let modCon = getAnimalModCon(animal, charAnimal);
    let modInt = getAnimalModInt(animal, charAnimal);
    let modWis = getAnimalModWis(animal, charAnimal);
    let modCha = getAnimalModCha(animal, charAnimal);
    
    qContent.append('<div class="columns is-centered is-marginless text-center mx-3"><div class="column is-2 is-paddingless"><p class="is-bold-thick">Str</p></div><div class="column is-2 is-paddingless"><p class="is-bold-thick">Dex</p></div><div class="column is-2 is-paddingless"><p class="is-bold-thick">Con</p></div><div class="column is-2 is-paddingless"><p class="is-bold-thick">Int</p></div><div class="column is-2 is-paddingless"><p class="is-bold-thick">Wis</p></div><div class="column is-2 is-paddingless"><p class="is-bold-thick">Cha</p></div></div>');
    qContent.append('<div class="columns is-centered is-marginless text-center mx-3"><div class="column is-2 is-paddingless"><p class="companion-bonus-offset">'+signNumber(modStr)+'</p></div><div class="column is-2 is-paddingless"><p class="companion-bonus-offset">'+signNumber(modDex)+'</p></div><div class="column is-2 is-paddingless"><p class="companion-bonus-offset">'+signNumber(modCon)+'</p></div><div class="column is-2 is-paddingless"><p class="companion-bonus-offset">'+signNumber(modInt)+'</p></div><div class="column is-2 is-paddingless"><p class="companion-bonus-offset">'+signNumber(modWis)+'</p></div><div class="column is-2 is-paddingless"><p class="companion-bonus-offset">'+signNumber(modCha)+'</p></div></div>');

    qContent.append('<hr class="my-2 mx-3" style="border-width: 3px;">');

    // Trained in Barding & Unarmored Defense, Perception, and all Saving Throws

    let percepBonus = modWis+getProfNumber(getAnimalPerceptionNumUps(animal, charAnimal), lvl);
    let AC = 10+modDex+getProfNumber(getAnimalUnarmoredDefenseNumUps(animal, charAnimal), lvl);

    let fortBonus = modCon+getProfNumber(getAnimalFortitudeNumUps(animal, charAnimal), lvl);
    let reflexBonus = modDex+getProfNumber(getAnimalReflexNumUps(animal, charAnimal), lvl);
    let willBonus = modWis+getProfNumber(getAnimalWillNumUps(animal, charAnimal), lvl);

    qContent.append('<div class="columns is-centered is-marginless text-center"><div class="column is-2 is-paddingless"><p class="is-bold">Perception</p></div><div class="column is-2 is-paddingless"><p class="is-bold">AC</p></div><div class="column is-2 is-paddingless border-left border-dark-lighter"><p class="is-bold">Fort.</p></div><div class="column is-2 is-paddingless"><p class="is-bold">Reflex</p></div><div class="column is-2 is-paddingless"><p class="is-bold">Will</p></div></div>');
    qContent.append('<div class="columns is-centered is-marginless text-center"><div class="column is-2 is-paddingless"><p class="companion-bonus-offset">'+signNumber(percepBonus)+'</p></div><div class="column is-2 is-paddingless"><p class="">'+AC+'</p></div><div class="column is-2 is-paddingless border-left border-dark-lighter"><p class="companion-bonus-offset">'+signNumber(fortBonus)+'</p></div><div class="column is-2 is-paddingless"><p class="companion-bonus-offset">'+signNumber(reflexBonus)+'</p></div><div class="column is-2 is-paddingless"><p class="companion-bonus-offset">'+signNumber(willBonus)+'</p></div></div>');

    qContent.append('<hr class="m-2">');

    let skillsArray = [];
    skillsArray.push('acrobatics');
    skillsArray.push('athletics');
    skillsArray.push('intimidation');
    skillsArray.push('stealth');
    skillsArray.push('survival');

    for(let skill of skillsArray){
        let skillData = g_skillMap.get(capitalizeWords(skill));
        let abilScore = skillData.Skill.ability;

        let abilMod = null;
        if(abilScore == 'STR'){ abilMod = modStr; } else if(abilScore == 'DEX'){ abilMod = modDex; } else if(abilScore == 'CON'){ abilMod = modCon; } else if(abilScore == 'INT'){ abilMod = modInt; } else if(abilScore == 'WIS'){ abilMod = modWis; } else if(abilScore == 'CHA'){ abilMod = modCha; }

        let skillNumUps = getAnimalSkillNumUps(animal, charAnimal, skill);
        if(skillNumUps != 0){
            let skillBonus = abilMod+getProfNumber(skillNumUps, lvl);

            qContent.append('<div class="px-4"><span class="has-text-grey-lighter">'+signNumber(skillBonus)+'</span><span class="pl-3 is-p">'+capitalizeWords(skill)+'</span></div>');
        }
    }

    qContent.append('<hr class="m-2">');

    let animalSize = getAnimalSize(animal, charAnimal);
    animalSize = (animalSize == 'MED-LARGE') ? 'Medium or Large' : capitalizeWords(animalSize);
    qContent.append('<div class="px-3"><p class="negative-indent"><strong>Size</strong> '+animalSize+'</p></div>');

    qContent.append('<div class="px-3"><p class="negative-indent"><strong>Speed</strong> '+animal.speeds+'</p></div>');

    let sensesText = animal.senses.toLowerCase();
    sensesText = sensesText.replace('low-light vision', '<span class="has-text-centered has-tooltip-bottom has-tooltip-multiline" data-tooltip="A creature with low-light vision can see in dim light as though it were bright light, so it ignores the concealed condition due to dim light."><em>low-light vision</em></span>');
    sensesText = sensesText.replace('darkvision', '<span class=" has-text-centered has-tooltip-bottom has-tooltip-multiline" data-tooltip="A creature with darkvision can see perfectly well in areas of darkness and dim light, though such vision is in black and white only. However, some forms of magical darkness, such as a 4th-level darkness spell, block normal darkvision."><em>darkvision</em></span>');
    sensesText = sensesText.replace('scent', '<span class="has-text-centered has-tooltip-bottom has-tooltip-multiline" data-tooltip="Scent involves sensing creatures or objects by smell. It functions only if the creature or object being detected emits an aroma (for instance, incorporeal creatures usually do not exude an aroma). If a creature emits a heavy aroma or is upwind, the GM can double or even triple the range of scent abilities used to detect that creature, and the GM can reduce the range if a creature is downwind."><em>scent</em></span>');
    sensesText = sensesText.replace('imprecise', '<span class="has-text-centered has-tooltip-bottom has-tooltip-multiline" data-tooltip="You can usually sense a creature automatically with an imprecise sense, but it has the hidden condition instead of the observed condition. At best, an imprecise sense can be used to make an undetected creature (or one you didn’t even know was there) merely hidden – it can’t make the creature observed. For more details on imprecise senses, see page 464."><em>imprecise</em></span>');


    qContent.append('<div class="px-3"><p class=""><strong>Senses</strong> '+sensesText+'</p></div>');

    if(animal.special != null){
        qContent.append('<div class="px-2">'+processText('~ Special: '+animal.special, true, true, 'MEDIUM')+'</div>');
    }

    qContent.append('<hr class="m-2">');

    displayAnimalCompanionAttack(qContent, animal, charAnimal, 1);
    displayAnimalCompanionAttack(qContent, animal, charAnimal, 2);
    displayAnimalCompanionAttack(qContent, animal, charAnimal, 3);

    // Advanced Man

    if(hasAnimalMagicalAttacks(animal, charAnimal)){
        qContent.append('<div class="px-2">'+processText(':> Your companion’s attacks become magical for the purpose of ignoring resistances.', true, true, 'MEDIUM')+'</div>');
    }

    qContent.append('<hr class="m-2">');

    qContent.append('<div class="px-2">'+processText('<span class="has-text-centered has-tooltip-right has-tooltip-multiline" data-tooltip="If your animal uses the Support action, the only other actions it can use on this turn are basic move actions to get into position to take advantage of the Support benefits; if it has already used any other action this turn, it can’t Support you.">**Support**</span> ONE-ACTION\n:> '+animal.supportBenefit, true, true, 'MEDIUM')+'</div>');

    qContent.append('<hr class="m-2">');

    qContent.append('<div class="field is-marginless mb-1"><div class="control"><textarea id="animalDescription" class="textarea use-custom-scrollbar" placeholder="Companion Description">'+charAnimal.description+'</textarea></div></div>');
    $('#animalDescription').blur(function() {
        if($('#animalDescription').val() != charAnimal.description){
            updateAnimalCompanion(charAnimal);
        }
    });

    qContent.append('<div class="field is-marginless mb-1"><div class="control"><input id="animalImageURL" class="input" type="text" maxlength="200" value="'+charAnimal.imageURL+'" placeholder="Image URL" spellcheck="false" autocomplete="off"></div></div>');
    $('#animalImageURL').blur(function() {
        if($('#animalImageURL').val() != charAnimal.imageURL){
            updateAnimalCompanion(charAnimal);
        }
    });


    qContent.append('<div class="field is-grouped is-grouped-centered"><div class="control"><div class="select is-info"><select id="selectAnimalAge"><option value="YOUNG">Young</option><option value="MATURE">Mature</option><option value="NIMBLE">Nimble</option><option value="SAVAGE">Savage</option></select></div></div><div class="control"><div class="select is-info"><select id="selectAnimalSpecialization"><option value="NONE">None</option><option value="AMBUSHER">Ambusher</option><option value="BULLY">Bully</option><option value="DAREDEVIL">Daredevil</option><option value="RACER">Racer</option><option value="TRACKER">Tracker</option><option value="WRECKER">Wrecker</option></select></div></div></div>');

    $('#selectAnimalAge').val(charAnimal.age);
    $('#selectAnimalSpecialization').val(charAnimal.specialization);

    $('#selectAnimalAge').change(function() {
        if($('#selectAnimalAge').val() != charAnimal.age){
            updateAnimalCompanion(charAnimal);
            openQuickView('animalCompanionView', {
                CharAnimalComp: charAnimal
            });
        }
    });

    $('#selectAnimalSpecialization').change(function() {
        if($('#selectAnimalSpecialization').val() != charAnimal.specialization){
            updateAnimalCompanion(charAnimal);
            openQuickView('animalCompanionView', {
                CharAnimalComp: charAnimal
            });
        }
    });
    
}

function displayAnimalCompanionAttack(qContent, animal, charAnimal, attackNum) {

    // Name //
    let attackName = animal['a'+attackNum+'Name'];
    if(attackName == null){ return; }
    attackName = attackName.toLowerCase();

    // Type //
    let attackType;
    switch(animal['a'+attackNum+'Type']){
        case 'MELEE': attackType = 'Melee'; break;
        case 'RANGED': attackType = 'Ranged'; break;
        default: break;
    }

    // Actions //
    let attackAction;
    switch(animal['a'+attackNum+'Actions']) {
        case 'FREE_ACTION': attackAction = 'FREE-ACTION'; break;
        case 'REACTION': attackAction = 'REACTION'; break;
        case 'ACTION': attackAction = 'ONE-ACTION'; break;
        case 'TWO_ACTIONS': attackAction = 'TWO-ACTIONS'; break;
        case 'THREE_ACTIONS': attackAction = 'THREE-ACTIONS'; break;
        default: break;
    }

    // Traits //
    let isFinesse = false;

    let attackTraits = '';
    let attackTraitsRaw = animal['a'+attackNum+'Tags'];
    if(attackTraitsRaw != null){
        let attackTraitsParts = attackTraitsRaw.split(', ');
        for(let attackTraitPart of attackTraitsParts){
            if(attackTraits != ''){ attackTraits += ', '; }
            attackTraits += '(trait: '+attackTraitPart+')';

            if(attackTraitPart == 'finesse'){
                isFinesse = true;
            }
        }
        attackTraits = ' ('+attackTraits+')';
    }

    // Attack Bonus //
    let trainedProfBonus = getProfNumber(getAnimalUnarmedAttacksNumUps(animal, charAnimal), g_character.level);
    let attackModToBonus = (isFinesse) ? animal.modDex : animal.modStr;

    let attackBonus = trainedProfBonus+attackModToBonus;
    attackBonus = '<span class="has-text-grey-lighter">'+signNumber(attackBonus)+'</span>';

    // Damage //
    let damageDieNum = getAnimalDamageDieNumber(animal, charAnimal);

    let damageDie = animal['a'+attackNum+'DmgDie'];

    let damageBonus = 0;
    if(attackType == 'Melee'){ damageBonus += animal.modStr; }
    damageBonus += getAnimalAdditionalDamage(animal, charAnimal);
    damageBonus = (damageBonus == 0) ? '' : signNumber(damageBonus);
    
    let damageType = animal['a'+attackNum+'DmgType'];

    // Finalize //
    let attackEntryText = '**'+attackType+'** '+attackAction+' '+attackBonus+' '+attackName+''+attackTraits+', **Damage** '+damageDieNum+''+damageDie+''+damageBonus+' '+damageType;
    qContent.append('<div class="px-2">'+processText(attackEntryText, true, true, 'MEDIUM')+'</div>');

}

function updateAnimalCompanion(charAnimalComp) {

    let updateValues = {
        Name : $('#animalName').val(),
        CurrentHealth : $('#healthInput').val(),
        Description : $('#animalDescription').val(),
        ImageURL : $('#animalImageURL').val(),
        Age : $('#selectAnimalAge').val(),
        Specialization : $('#selectAnimalSpecialization').val(),
    };

    charAnimalComp.name = updateValues.Name;
    charAnimalComp.currentHP = updateValues.CurrentHealth;
    charAnimalComp.description = updateValues.Description;
    charAnimalComp.imageURL = updateValues.ImageURL;
    charAnimalComp.age = updateValues.Age;
    charAnimalComp.specialization = updateValues.Specialization;

    socket.emit("requestUpdateAnimalCompanion",
        getCharIDFromURL(),
        charAnimalComp.id,
        updateValues);

}

socket.on("returnUpdateAnimalCompanion", function(){
    displayCompanionsSection();
});

socket.on("returnRemoveAnimalCompanion", function(charAnimalCompID){

    let newAnimalCompanions = [];
    for(let charAnimal of g_companionData.AnimalCompanions){
        if(charAnimal.id != charAnimalCompID){
            newAnimalCompanions.push(charAnimal);
        }
    }
    g_companionData.AnimalCompanions = newAnimalCompanions;

    closeQuickView();
    displayCompanionsSection();
});