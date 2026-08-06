window.addEventListener('scroll', () => {
    scrollUpdate();
});
document.addEventListener("DOMContentLoaded", function () {
    setTimeout(() => {
        scrollUpdate();
    }, 30);
})

function scrollUpdate() {
    let scrollPosition = window.scrollY;

    headerbg.style.transform = `translateY(${scrollPosition * 0.13}%)`;

    if (scrollPosition > 40) {
        document.querySelector('.nav').style.background = 'rgba(28,28,28,1)';
    }
    else {
        document.querySelector('.nav').style.background = 'transparent';
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const carousels = document.querySelectorAll('.carosel');

    carousels.forEach(carousel => {
        setupCarousel(carousel);
    });

    function setupCarousel(carousel) {
        // 1. Get all images currently in the div
        const images = Array.from(carousel.querySelectorAll('img'));
        
        // 2. Create the internal structure
        // We need a "track" div to hold images so we can slide them
        const track = document.createElement('div');
        track.classList.add('carosel-track');
        
        // Move images into the track
        images.forEach(img => track.appendChild(img));
        carousel.appendChild(track);

        // 3. Create Buttons (Prev/Next)
        const prevBtn = document.createElement('button');
        prevBtn.innerText = '❮';
        prevBtn.classList.add('carosel-btn', 'carosel-prev');
        
        const nextBtn = document.createElement('button');
        nextBtn.innerText = '❯';
        nextBtn.classList.add('carosel-btn', 'carosel-next');

        carousel.appendChild(prevBtn);
        carousel.appendChild(nextBtn);

        // 4. Create Dots Container
        const dotsContainer = document.createElement('div');
        dotsContainer.classList.add('carosel-dots');
        
        // Create a dot for each image
        images.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('carosel-dot');
            if (index === 0) dot.classList.add('active');
            
            // Add click event to dot
            dot.addEventListener('click', () => {
                goToSlide(index);
            });
            
            dotsContainer.appendChild(dot);
        });
        carousel.appendChild(dotsContainer);

        // 5. State Management
        let currentIndex = 0;

        function updateCarousel() {
            // Slide the track
            const width = carousel.getBoundingClientRect().width;
            track.style.transform = `translateX(-${currentIndex * 100}%)`;

            // Update dots
            const dots = dotsContainer.querySelectorAll('.carosel-dot');
            dots.forEach((dot, index) => {
                if (index === currentIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        function goToSlide(index) {
            // Handle loop logic
            if (index < 0) {
                currentIndex = images.length - 1;
            } else if (index >= images.length) {
                currentIndex = 0;
            } else {
                currentIndex = index;
            }
            updateCarousel();
        }

        // 6. Event Listeners for Buttons
        prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
        nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));

        // 7. Handle Window Resize (Optional, keeps alignment correct)
        window.addEventListener('resize', updateCarousel);
    }
});