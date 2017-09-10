var mobileMenu = document.querySelector('.mobile-menu');
  mobileMenu.addEventListener('click', function() {
    this.parentNode.lastElementChild.classList.toggle('show');
  })
