document.querySelectorAll('.mod-tab .tab').forEach(function(node){
  node.addEventListener('click', function(){
    var index
    this.parentElement.querySelectorAll('.tab').forEach(function(tab, idx){
      tab.classList.remove('active')
      if(node === tab){
        index = idx
      }
    })
    this.classList.add('active')
    this.parentElement.nextElementSibling.querySelectorAll('.panel').forEach(function(panel){
      panel.classList.remove('active')
    })
    this.parentElement.nextElementSibling.querySelectorAll('.panel')[index].classList.add('active')
  })
})

