/* Copyright (C) 2020, Wanderer's Guide, all rights reserved.
    By Aaron Cassar.
*/

class DisplayUniHeritage {
  constructor(containerID, uniHeritageID, featMap) {
    featMap = new Map([...featMap.entries()].sort(
      function(a, b) {
          if (a[1].Feat.level === b[1].Feat.level) {
              // Name is only important when levels are the same
              return a[1].Feat.name > b[1].Feat.name ? 1 : -1;
          }
          return a[1].Feat.level - b[1].Feat.level;
      })
    );

    let uniHeritageDisplayContainerID = 'uni-heritage-container-'+uniHeritageID;
    $('#'+containerID).parent().append('<div id="'+uniHeritageDisplayContainerID+'" class="is-hidden"></div>');
    $('#'+containerID).addClass('is-hidden');

    socket.emit('requestGeneralUniHeritage', uniHeritageID);
    socket.off('returnGeneralUniHeritage');
    socket.on("returnGeneralUniHeritage", function(uniHeritageStruct){
      $('#'+uniHeritageDisplayContainerID).load("/templates/display-uni-heritage.html");
      $.ajax({ type: "GET",
        url: "/templates/display-uni-heritage.html",
        success : function(text)
        {

          $('#uni-heritage-back-btn').click(function() {
            $('#'+uniHeritageDisplayContainerID).remove();
            $('#'+containerID).removeClass('is-hidden');
          });
          $('.category-tabs li').click(function() {
            $('#'+uniHeritageDisplayContainerID).remove();
            $('#'+containerID).removeClass('is-hidden');
          });

          $('#uni-heritage-name').html(uniHeritageStruct.heritage.name);
          $('#uni-heritage-description').html(processText(uniHeritageStruct.heritage.description, false, null));

          let sourceStr = '';
          let uniHeritageRarity = convertRarityToHTML(uniHeritageStruct.heritage.rarity, true);
          if(uniHeritageRarity == ''){
            sourceStr = getContentSourceTextName(uniHeritageStruct.heritage.contentSrc);
          } else {
            sourceStr = '<span class="pr-2">'+getContentSourceTextName(uniHeritageStruct.heritage.contentSrc)+'</span>';
          }
          $('#uni-heritage-source').html(sourceStr+uniHeritageRarity);

          ///

          let uniHeritageFeatLevel = 0;
          for(const [featID, featStruct] of featMap.entries()){
            let tag = featStruct.Tags.find(tag => {
              return tag.id === uniHeritageStruct.heritage.tagID;
            });
            if(tag != null){
              if(featStruct.Feat.level <= 0) { continue; }
              if(featStruct.Feat.level > uniHeritageFeatLevel){
                uniHeritageFeatLevel = featStruct.Feat.level;
                $('#uni-heritage-feats').append('<div class="border-bottom border-dark-lighter has-background-black-like-more text-center is-bold"><p>Level '+uniHeritageFeatLevel+'</p></div>');
              }
              let featEntryID = 'uni-heritage-feat-'+featStruct.Feat.id;
              $('#uni-heritage-feats').append('<div id="'+featEntryID+'" class="border-bottom border-dark-lighter px-2 py-2 has-background-black-ter cursor-clickable"><span class="pl-4">'+featStruct.Feat.name+convertActionToHTML(featStruct.Feat.actions)+'</span><span class="is-pulled-right is-size-7 has-text-grey is-italic">'+getContentSourceTextName(featStruct.Feat.contentSrc)+'</span></div>');

              $('#'+featEntryID).click(function(){
                openQuickView('featView', {
                  Feat : featStruct.Feat,
                  Tags : featStruct.Tags
                });
              });
          
              $('#'+featEntryID).mouseenter(function(){
                $(this).removeClass('has-background-black-ter');
                $(this).addClass('has-background-grey-darker');
              });
              $('#'+featEntryID).mouseleave(function(){
                $(this).removeClass('has-background-grey-darker');
                $(this).addClass('has-background-black-ter');
              });
              
            }
          }
          
          $('#'+uniHeritageDisplayContainerID).removeClass('is-hidden');
        }
      });
    });
  }
}