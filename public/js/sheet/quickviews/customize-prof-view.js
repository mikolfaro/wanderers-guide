
function openCustomizeProfQuickview(data) {
    addBackFunctionality(data);

    let profName = data.ProfData.Name.replace(/_/g,' ');
    $('#quickViewTitle').html("Customize - "+profName);
    let qContent = $('#quickViewContent');

    qContent.append('<div class="field is-horizontal"><div class="field-label is-normal"><label class="label">Proficiency</label></div><div class="field-body"><div class="field"><div class="control"><div class="select"><select id="customizeProf"><option value="chooseDefault">Default</option><option value="U">Untrained</option><option value="T">Trained</option><option value="E">Expert</option><option value="M">Master</option><option value="L">Legendary</option></select></div></div></div></div></div>');

    let userBonus = (data.ProfData.UserBonus != null) ? data.ProfData.UserBonus : 0;
    qContent.append('<div class="field is-horizontal"><div class="field-label is-normal"><label class="label" style="white-space: nowrap;">Extra Bonus</label></div><div class="field-body"><div class="field"><div class="control" style="max-width: 120px;"><input id="customizeBonus" class="input" type="number" min="0" max="100" value="'+userBonus+'"></div></div></div></div>');

    qContent.append('<div class="buttons is-centered pt-2"><button id="customizeSaveButton" class="button is-link is-rounded">Save</button></div>');

    if(data.ProfData.UserProfOverride != null && data.ProfData.UserProfOverride){
        $('#customizeProf').val(data.ProfData.OriginalData.Prof);
    } else {
        $('#customizeProf').val('chooseDefault');
    }

    console.log(data.ProfData);

    $('#customizeSaveButton').click(function(){

        // Reloads character sheet twice, which is unnecessary.

        let prof = $('#customizeProf').val();
        let userBonus = $('#customizeBonus').val();

        console.log(prof);
        console.log(userBonus);

        let srcStructProf = {
            sourceType: 'user-set',
            sourceLevel: 0,
            sourceCode: data.ProfData.OriginalData.To+",,,Prof",
            sourceCodeSNum: 'a',
        };
        if(prof === 'chooseDefault'){
            socket.emit("requestProficiencyChange",
                getCharIDFromURL(),
                {srcStruct : srcStructProf},
                null
            );
        } else {
            socket.emit("requestProficiencyChange",
                getCharIDFromURL(),
                {srcStruct : srcStructProf},
                {
                    For : data.ProfData.OriginalData.For,
                    To : data.ProfData.OriginalData.To,
                    Prof : prof
                }
            );
        }

        let srcStructBonus = {
            sourceType: 'user-set',
            sourceLevel: 0,
            sourceCode: data.ProfData.OriginalData.To+",,,Bonus",
            sourceCodeSNum: 'a',
        };
        if(userBonus == 0 || userBonus == ''){
            socket.emit("requestProficiencyChange",
                getCharIDFromURL(),
                {srcStruct : srcStructBonus},
                null
            );
        } else {
            socket.emit("requestProficiencyChange",
                getCharIDFromURL(),
                {srcStruct : srcStructBonus},
                {
                    For : data.ProfData.OriginalData.For,
                    To : data.ProfData.OriginalData.To,
                    Prof : parseInt(userBonus)
                }
            );
        }

    });

}