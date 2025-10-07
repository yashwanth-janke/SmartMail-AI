/**
 * SmartMail AI - Main JavaScript
 * General utilities and animations
 */

(function($) {
    'use strict';

    // Initialize on document ready
    $(document).ready(function() {
        initSmoothScroll();
        initAnimations();
        initTooltips();
    });

    /**
     * Smooth scroll for anchor links
     */
    function initSmoothScroll() {
        $('a[href^="#"]').on('click', function(e) {
            const target = $(this.getAttribute('href'));
            if (target.length) {
                e.preventDefault();
                $('html, body').stop().animate({
                    scrollTop: target.offset().top - 80
                }, 1000);
            }
        });
    }

    /**
     * Initialize fade-in animations on scroll
     */
    function initAnimations() {
        // Add fade-in class to elements when they come into view
        $(window).on('scroll', function() {
            $('.feature-card, .step-card').each(function() {
                const elementTop = $(this).offset().top;
                const windowBottom = $(window).scrollTop() + $(window).height();
                
                if (elementTop < windowBottom - 50) {
                    $(this).addClass('fade-in');
                }
            });
        });

        // Trigger on load
        $(window).trigger('scroll');
    }

    /**
     * Initialize Bootstrap tooltips
     */
    function initTooltips() {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }

    /**
     * Show toast notification
     * @param {string} title - Toast title
     * @param {string} message - Toast message
     * @param {string} type - Toast type (success, error, info, warning)
     */
    window.showToast = function(title, message, type = 'success') {
        const toast = $('#notificationToast');
        const toastTitle = $('#toastTitle');
        const toastMessage = $('#toastMessage');
        const toastIcon = $('#toastIcon');

        // Set content
        toastTitle.text(title);
        toastMessage.text(message);

        // Set icon and color based on type
        let iconClass = 'fas fa-check-circle text-success';
        switch(type) {
            case 'error':
                iconClass = 'fas fa-exclamation-circle text-danger';
                break;
            case 'warning':
                iconClass = 'fas fa-exclamation-triangle text-warning';
                break;
            case 'info':
                iconClass = 'fas fa-info-circle text-info';
                break;
        }
        toastIcon.attr('class', iconClass + ' me-2');

        // Show toast
        const bsToast = new bootstrap.Toast(toast[0]);
        bsToast.show();
    };

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>}
     */
    window.copyToClipboard = async function(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                document.body.removeChild(textarea);
                return true;
            } catch (err) {
                document.body.removeChild(textarea);
                return false;
            }
        }
    };

    /**
     * Format timestamp
     * @param {string} timestamp - Timestamp string
     * @returns {string}
     */
    window.formatTimestamp = function(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        // Less than a minute
        if (diff < 60000) {
            return 'Just now';
        }
        
        // Less than an hour
        if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        }
        
        // Less than a day
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        }
        
        // More than a day
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

})(jQuery);
