// after the dom is loaded
document.addEventListener("DOMContentLoaded", function() {
  const left = document.getElementById("left-side");

  const handleMove = e => {
    left.style.width = `${e.clientX / window.innerWidth * 100}%`;
  }

  document.onmousemove = e => handleMove(e);

  document.ontouchmove = e => handleMove(e.touches[0]);
}
);
