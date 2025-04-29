// Theme Toggle Functionality
(function() {
  'use strict';

  // Check for saved theme preference or use the system preference
  function getThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
      return savedTheme;
    } else {
      // Check if user has dark mode enabled at system level
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
  }

  // Apply the theme with a visual transition effect
  function applyTheme(theme, animate = true) {
    // Add transition class if animation is requested
    if (animate) {
      document.body.classList.add('theme-transition');
      
      // Remove the transition class after the transition completes
      setTimeout(() => {
        document.body.classList.remove('theme-transition');
      }, 500);
    }
    
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
      updateMetaThemeColor('#1a1a1a'); // Update theme-color meta tag for dark mode
    } else {
      document.body.classList.remove('dark-theme');
      updateMetaThemeColor('#ffffff'); // Update theme-color meta tag for light mode
    }
    
    // Update UI elements like images that might need to change with theme
    updateUIForTheme(theme);
    
    // Save the preference
    localStorage.setItem('theme', theme);
  }

  // Update meta theme-color for browser UI
  function updateMetaThemeColor(color) {
    // Find the theme-color meta tag if it exists, otherwise create it
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    
    metaThemeColor.content = color;
  }
  
  // Update UI elements based on theme (e.g., images that might need different versions)
  function updateUIForTheme(theme) {
    // Add a data attribute to the html element for potential CSS targeting
    document.documentElement.setAttribute('data-theme', theme);
    
    // Handle specific elements that might need direct manipulation
    handleMarkdownView(theme);
    
    // Update copy button colors
    updateCopyButtonColors(theme);
    
    // Handle pagination elements specifically for #pagination-content
    handlePaginationElements(theme);
  }
  
  // Handle markdown view container specifically
  function handleMarkdownView(theme) {
    // Check if the markdown view exists
    const markdownView = document.getElementById('markdown-view');
    if (markdownView) {
      if (theme === 'dark') {
        markdownView.style.backgroundColor = '#222';
        markdownView.style.color = '#e0e0e0';
        
        // Force background color on the preview container
        const previewContainer = document.querySelector('.editormd-preview-container');
        if (previewContainer) {
          previewContainer.style.backgroundColor = '#222';
          previewContainer.style.color = '#e0e0e0';
        }
      } else {
        markdownView.style.backgroundColor = '';
        markdownView.style.color = '';
        
        // Reset preview container
        const previewContainer = document.querySelector('.editormd-preview-container');
        if (previewContainer) {
          previewContainer.style.backgroundColor = '';
          previewContainer.style.color = '';
        }
      }
    }
  }
  
  // Update copy button colors based on theme
  function updateCopyButtonColors(theme) {
    const copyButtons = document.querySelectorAll('.copy-button');
    if (copyButtons.length > 0) {
      copyButtons.forEach(button => {
        if (theme === 'dark') {
          button.style.backgroundColor = '#FF6B9D';
        } else {
          button.style.backgroundColor = '#FC5185';
        }
      });
    }
  }

  // Handle pagination elements in #pagination-content
  function handlePaginationElements(theme) {
    // First handle the pagination container itself
    const paginationContainer = document.getElementById('pagination');
    const paginationContentDiv = document.getElementById('pagination-content');
    
    if (paginationContainer) {
      if (theme === 'dark') {
        paginationContainer.style.backgroundColor = '#1a1a1a';
      } else {
        paginationContainer.style.backgroundColor = '';
      }
    }
    
    // Also get any pagination containers
    const paginationDivs = document.querySelectorAll('.pagination');
    if (paginationDivs.length > 0) {
      paginationDivs.forEach(div => {
        if (theme === 'dark') {
          div.style.backgroundColor = '#1a1a1a';
        } else {
          div.style.backgroundColor = '';
        }
      });
    }
    
    // Handle individual pagination elements
    const paginationContent = document.getElementById('pagination-content');
    if (paginationContent) {
      const paginationItems = paginationContent.querySelectorAll('.pagination li');
      const paginationActive = paginationContent.querySelectorAll('.pagination .active, .pagination li.active');
      
      if (theme === 'dark') {
        // Apply dark theme styles directly
        paginationItems.forEach(item => {
          item.style.backgroundColor = '#222';
          item.style.color = '#c5c5c5';
        });
        
        paginationActive.forEach(active => {
          active.style.backgroundColor = '#FF6B9D';
          active.style.color = 'white';
          
          // Also style any anchors inside active elements
          const activeAnchors = active.querySelectorAll('a');
          activeAnchors.forEach(a => {
            a.style.color = 'white';
          });
        });
      } else {
        // Reset to default styles for light theme
        paginationItems.forEach(item => {
          item.style.backgroundColor = '';
          item.style.color = '';
        });
        
        paginationActive.forEach(active => {
          active.style.backgroundColor = '';
          active.style.color = '';
          
          // Reset anchor styles
          const activeAnchors = active.querySelectorAll('a');
          activeAnchors.forEach(a => {
            a.style.color = '';
          });
        });
      }
    }
  }

  // Toggle the theme with a visual effect
  function toggleTheme() {
    const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Add ripple effect to the toggle button
    addRippleEffect(this);
    
    applyTheme(newTheme, true);
  }
  
  // Add a ripple effect to the button when clicked
  function addRippleEffect(button) {
    // Create a ripple element
    const ripple = document.createElement('span');
    ripple.classList.add('theme-toggle-ripple');
    button.appendChild(ripple);
    
    // Remove it after animation completes
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  // Add CSS for the ripple effect
  function addRippleStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .theme-transition * {
        transition: background-color 0.5s ease, color 0.5s ease, border-color 0.5s ease, box-shadow 0.5s ease !important;
      }
      
      .theme-toggle-ripple {
        position: absolute;
        background: rgba(255, 255, 255, 0.7);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
      }
      
      @keyframes ripple {
        to {
          transform: scale(2.5);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // DOM ready
  document.addEventListener('DOMContentLoaded', function() {
    // Add ripple styles
    addRippleStyles();
    
    // Create the toggle button
    const themeToggle = document.createElement('div');
    themeToggle.className = 'theme-toggle';
    themeToggle.setAttribute('title', 'Toggle dark/light mode');
    themeToggle.setAttribute('aria-label', 'Toggle dark/light mode');
    themeToggle.setAttribute('role', 'button');
    themeToggle.setAttribute('tabindex', '0');
    document.body.appendChild(themeToggle);
    
    // Add click event
    themeToggle.addEventListener('click', toggleTheme);
    
    // Also allow keyboard activation
    themeToggle.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleTheme.call(this);
      }
    });
    
    // Apply initial theme without animation on first load
    applyTheme(getThemePreference(), false);
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem('theme')) {
        applyTheme(e.matches ? 'dark' : 'light', true);
      }
    });
    
    // Apply theme when markdown content is loaded or changes
    // For dynamic content loading
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          handleMarkdownView(document.body.classList.contains('dark-theme') ? 'dark' : 'light');
          updateCopyButtonColors(document.body.classList.contains('dark-theme') ? 'dark' : 'light');
        }
      });
    });
    
    // Start observing the target node for configured mutations
    const targetNode = document.getElementById('english-content');
    if (targetNode) {
      observer.observe(targetNode, { childList: true, subtree: true });
    }
  });
})(); 