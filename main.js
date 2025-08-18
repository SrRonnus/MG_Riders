function toggleDropdown() {
      document.getElementById('menuDropdown').classList.toggle('show');
    }
    // Cierra el menú si se hace clic fuera
    window.onclick = function(event) {

      if (!event.target.matches('.dropdown-btn')) {
        
        var dropdowns = document.getElementsByClassName("dropdown");
        
        for (var i = 0; i < dropdowns.length; i++) {
          
          var openDropdown = dropdowns[i];
          
          if (openDropdown.classList.contains('show')) {
            openDropdown.classList.remove('show');
          }
        }
      }
    }