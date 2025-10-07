/**
 * SmartMail AI - Rewrite Page JavaScript
 * Handles email rewriting, voice input, and UI interactions
 * Uses Promises, async/await, and callbacks as required
 */

(function($) {
    'use strict';

    // State management
    let isListening = false;
    let recognition = null;
    let currentEmail = {
        original: '',
        rewritten: '',
        tone: 'professional'
    };

    // Initialize on document ready
    $(document).ready(function() {
        initializeElements();
        initializeSpeechRecognition();
        setupEventListeners();
    });

    /**
     * Initialize DOM elements
     */
    function initializeElements() {
        // Get all elements
        window.elements = {
            emailInput: $('#emailInput'),
            toneSelect: $('#toneSelect'),
            rewriteButton: $('#rewriteButton'),
            clearButton: $('#clearButton'),
            micButton: $('#micButton'),
            copyButton: $('#copyButton'),
            regenerateButton: $('#regenerateButton'),
            charCount: $('#charCount'),
            voiceStatus: $('#voiceStatus'),
            voiceStatusText: $('#voiceStatusText'),
            loadingSpinner: $('#loadingSpinner'),
            outputPlaceholder: $('#outputPlaceholder'),
            resultSection: $('#resultSection'),
            rewrittenOutput: $('#rewrittenOutput'),
            appliedTone: $('#appliedTone'),
            timestamp: $('#timestamp')
        };
    }

    /**
     * Initialize Speech Recognition API
     * Uses callbacks for event handling
     */
    function initializeSpeechRecognition() {
        // Check browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            elements.micButton.prop('disabled', true);
            elements.micButton.attr('title', 'Speech recognition not supported in this browser');
            console.warn('Speech Recognition API not supported');
            return;
        }

        // Create recognition instance
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        // Callback: When speech recognition starts
        recognition.onstart = function() {
            console.log('Speech recognition started');
            isListening = true;
            updateVoiceStatus('Listening... Speak now!', 'alert-danger');
            elements.micButton.addClass('listening');
            elements.micButton.html('<i class="fas fa-stop me-2"></i>Stop Listening');
        };

        // Callback: When speech is recognized
        recognition.onresult = function(event) {
            let interimTranscript = '';
            let finalTranscript = '';

            // Process all results
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }

            // Update textarea with final transcript
            if (finalTranscript) {
                const currentText = elements.emailInput.val();
                elements.emailInput.val(currentText + finalTranscript);
                updateCharCount();
                validateInput();
            }

            // Show interim results in status
            if (interimTranscript) {
                elements.voiceStatusText.text(`Hearing: "${interimTranscript}"`);
            }
        };

        // Callback: When speech recognition ends
        recognition.onend = function() {
            console.log('Speech recognition ended');
            isListening = false;
            stopVoiceInput();
        };

        // Callback: When an error occurs
        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            isListening = false;
            stopVoiceInput();
            
            let errorMessage = 'Error occurred. Please try again.';
            switch(event.error) {
                case 'no-speech':
                    errorMessage = 'No speech detected. Please try again.';
                    break;
                case 'audio-capture':
                    errorMessage = 'Microphone not found or not permitted.';
                    break;
                case 'not-allowed':
                    errorMessage = 'Microphone permission denied.';
                    break;
            }
            
            showToast('Voice Input Error', errorMessage, 'error');
        };
    }

    /**
     * Setup all event listeners
     */
    function setupEventListeners() {
        // Character count update
        elements.emailInput.on('input', function() {
            updateCharCount();
            validateInput();
        });

        // Microphone button click
        elements.micButton.on('click', toggleVoiceInput);

        // Clear button click
        elements.clearButton.on('click', clearForm);

        // Rewrite button click (uses async/await)
        elements.rewriteButton.on('click', handleRewrite);

        // Copy button click
        elements.copyButton.on('click', handleCopy);

        // Regenerate button click
        elements.regenerateButton.on('click', handleRegenerate);

        // Tone select change
        elements.toneSelect.on('change', function() {
            currentEmail.tone = $(this).val();
        });
    }

    /**
     * Update character count
     */
    function updateCharCount() {
        const count = elements.emailInput.val().length;
        elements.charCount.text(count);
        
        if (count > 4500) {
            elements.charCount.css('color', 'var(--accent-danger)');
        } else if (count > 4000) {
            elements.charCount.css('color', 'var(--accent-warning)');
        } else {
            elements.charCount.css('color', 'var(--text-muted)');
        }
    }

    /**
     * Validate input and enable/disable rewrite button
     */
    function validateInput() {
        const text = elements.emailInput.val().trim();
        const isValid = text.length >= 10 && text.length <= 5000;
        elements.rewriteButton.prop('disabled', !isValid);
    }

    /**
     * Toggle voice input on/off
     */
    function toggleVoiceInput() {
        if (!recognition) {
            showToast('Not Supported', 'Speech recognition is not supported in your browser', 'error');
            return;
        }

        if (isListening) {
            stopVoiceInput();
        } else {
            startVoiceInput();
        }
    }

    /**
     * Start voice input
     */
    function startVoiceInput() {
        try {
            recognition.start();
            updateVoiceStatus('Starting...', 'alert-info');
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            showToast('Error', 'Could not start voice input', 'error');
        }
    }

    /**
     * Stop voice input
     */
    function stopVoiceInput() {
        if (recognition && isListening) {
            recognition.stop();
        }
        isListening = false;
        elements.micButton.removeClass('listening');
        elements.micButton.html('<i class="fas fa-microphone me-2"></i>Voice Input');
        elements.voiceStatus.addClass('d-none');
    }

    /**
     * Update voice status display
     */
    function updateVoiceStatus(text, alertClass = 'alert-info') {
        elements.voiceStatus.removeClass('d-none alert-info alert-danger alert-success');
        elements.voiceStatus.addClass(alertClass);
        elements.voiceStatusText.text(text);
    }

    /**
     * Clear form
     */
    function clearForm() {
        elements.emailInput.val('');
        updateCharCount();
        validateInput();
        hideResult();
        stopVoiceInput();
        showToast('Cleared', 'Form has been cleared', 'info');
    }

    /**
     * Handle rewrite button click
     * Uses async/await for API call
     */
    async function handleRewrite() {
        const text = elements.emailInput.val().trim();
        const tone = elements.toneSelect.val();

        if (text.length < 10) {
            showToast('Invalid Input', 'Please enter at least 10 characters', 'warning');
            return;
        }

        // Save current email
        currentEmail.original = text;
        currentEmail.tone = tone;

        // Show loading state
        showLoading();

        try {
            // Make API call using async/await with Promise
            const result = await rewriteEmail(text, tone);
            
            // Hide loading and show result
            hideLoading();
            displayResult(result);
            
            showToast('Success!', 'Email rewritten successfully', 'success');
        } catch (error) {
            hideLoading();
            showToast('Error', error.message || 'Failed to rewrite email', 'error');
            console.error('Rewrite error:', error);
        }
    }

    /**
     * Rewrite email using API
     * Returns a Promise (async function)
     * @param {string} text - Original email text
     * @param {string} tone - Desired tone
     * @returns {Promise<Object>}
     */
    async function rewriteEmail(text, tone) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await fetch('/api/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        text: text,
                        tone: tone,
                        save_history: true
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    reject(new Error(errorData.error || 'Server error'));
                    return;
                }

                const data = await response.json();
                
                if (data.success) {
                    currentEmail.rewritten = data.rewritten_text;
                    resolve(data);
                } else {
                    reject(new Error(data.error || 'Unknown error'));
                }
            } catch (error) {
                reject(new Error('Network error. Please check your connection.'));
            }
        });
    }

    /**
     * Show loading spinner
     */
    function showLoading() {
        elements.rewriteButton.prop('disabled', true);
        elements.outputPlaceholder.addClass('d-none');
        elements.resultSection.addClass('d-none');
        elements.loadingSpinner.removeClass('d-none').hide().fadeIn(300);
    }

    /**
     * Hide loading spinner
     */
    function hideLoading() {
        elements.loadingSpinner.fadeOut(300, function() {
            $(this).addClass('d-none');
        });
        elements.rewriteButton.prop('disabled', false);
    }

    /**
     * Display rewrite result with jQuery animation
     * @param {Object} result - API response data
     */
    function displayResult(result) {
        // Update content
        elements.rewrittenOutput.text(result.rewritten_text);
        elements.appliedTone.text(result.tone.charAt(0).toUpperCase() + result.tone.slice(1));
        elements.timestamp.text(formatTimestamp(result.timestamp));

        // Show result with fade-in animation
        elements.resultSection.removeClass('d-none').hide().fadeIn(500);
        
        // Scroll to result smoothly
        $('html, body').animate({
            scrollTop: elements.resultSection.offset().top - 100
        }, 500);
    }

    /**
     * Hide result section
     */
    function hideResult() {
        elements.resultSection.fadeOut(300, function() {
            $(this).addClass('d-none');
        });
        elements.outputPlaceholder.removeClass('d-none').hide().fadeIn(300);
    }

    /**
     * Handle copy to clipboard
     * Uses callback pattern with Promise
     */
    function handleCopy() {
        const text = elements.rewrittenOutput.text();
        
        // Use copyToClipboard function which returns a Promise
        copyToClipboard(text).then(success => {
            if (success) {
                showToast('Copied!', 'Email copied to clipboard', 'success');
                
                // Visual feedback
                elements.copyButton.html('<i class="fas fa-check me-2"></i>Copied!');
                setTimeout(() => {
                    elements.copyButton.html('<i class="fas fa-copy me-2"></i>Copy to Clipboard');
                }, 2000);
            } else {
                showToast('Error', 'Failed to copy to clipboard', 'error');
            }
        });
    }

    /**
     * Handle regenerate button click
     */
    function handleRegenerate() {
        if (currentEmail.original) {
            showToast('Regenerating', 'Creating a new version...', 'info');
            
            // Wait a moment for better UX
            setTimeout(() => {
                handleRewrite();
            }, 500);
        }
    }

    /**
     * Format timestamp for display
     * @param {string} timestamp - Timestamp string
     * @returns {string}
     */
    function formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

})(jQuery);
