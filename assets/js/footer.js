document.addEventListener('DOMContentLoaded',()=>{
  const slot=document.getElementById('site-footer');
  if(!slot) return;
  fetch('partials/footer.html')
    .then(r=>r.text())
    .then(html=>{slot.innerHTML=html;})
    .catch(()=>{slot.innerHTML='';});
});