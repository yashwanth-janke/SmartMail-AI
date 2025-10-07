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
    let currentMode = 'write'; // 'write' or 'rewrite'
    let currentEmail = {
        original: '',
        generated: '',
        tone: 'professional',
        template: null
    };

    // Initialize on document ready
    $(document).ready(function() {
        initializeElements();
        initializeSpeechRecognition();
        setupEventListeners();
        updateUIForMode();
    });

    /**
     * Initialize DOM elements
     */
    function initializeElements() {
        // Get all elements
        window.elements = {
            emailInput: $('#emailInput'),
            toneSelect: $('#toneSelect'),
            generateButton: $('#generateButton'),
            clearButton: $('#clearButton'),
            micButton: $('#micButton'),
            copyButton: $('#copyButton'),
            regenerateButton: $('#regenerateButton'),
            editButton: $('#editButton'),
            charCount: $('#charCount'),
            voiceStatus: $('#voiceStatus'),
            voiceStatusText: $('#voiceStatusText'),
            loadingSpinner: $('#loadingSpinner'),
            outputPlaceholder: $('#outputPlaceholder'),
            resultSection: $('#resultSection'),
            generatedOutput: $('#generatedOutput'),
            appliedTone: $('#appliedTone'),
            timestamp: $('#timestamp'),
            writeMode: $('#writeMode'),
            rewriteMode: $('#rewriteMode'),
            writeTemplates: $('#writeTemplates'),
            inputTitle: $('#inputTitle'),
            outputTitle: $('#outputTitle'),
            inputLabel: $('#inputLabel'),
            buttonText: $('#buttonText'),
            modeDisplay: $('#modeDisplay')
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

        // Mode toggle buttons
        elements.writeMode.on('click', function() {
            switchMode('write');
        });

        elements.rewriteMode.on('click', function() {
            switchMode('rewrite');
        });

        // Template selection
        $('.template-card').on('click', function() {
            selectTemplate($(this).data('template'));
        });

        // Microphone button click
        elements.micButton.on('click', toggleVoiceInput);

        // Clear button click
        elements.clearButton.on('click', clearForm);

        // Generate button click (uses async/await)
        elements.generateButton.on('click', handleGenerate);

        // Copy button click
        elements.copyButton.on('click', handleCopy);

        // Regenerate button click
        elements.regenerateButton.on('click', handleRegenerate);

        // Edit button click
        elements.editButton.on('click', handleEdit);

        // Tone select change
        elements.toneSelect.on('change', function() {
            currentEmail.tone = $(this).val();
        });
    }

    /**
     * Switch between Write and Rewrite modes
     */
    function switchMode(mode) {
        currentMode = mode;
        
        // Update button states
        if (mode === 'write') {
            elements.writeMode.addClass('active');
            elements.rewriteMode.removeClass('active');
        } else {
            elements.rewriteMode.addClass('active');
            elements.writeMode.removeClass('active');
        }
        
        // Update UI
        updateUIForMode();
        clearForm();
    }

    /**
     * Update UI based on current mode
     */
    function updateUIForMode() {
        if (currentMode === 'write') {
            elements.writeTemplates.show();
            elements.inputTitle.text('Email Content');
            elements.outputTitle.text('Generated Email');
            elements.inputLabel.text('What would you like to write about?');
            elements.buttonText.text('Generate Email');
            elements.emailInput.attr('placeholder', 'Describe what you want to say, or write your email draft here...');
            elements.modeDisplay.text('Mode: Write');
        } else {
            elements.writeTemplates.hide();
            elements.inputTitle.text('Original Email');
            elements.outputTitle.text('Rewritten Email');
            elements.inputLabel.text('Enter your email to rewrite');
            elements.buttonText.text('Rewrite Email');
            elements.emailInput.attr('placeholder', 'Paste your existing email here or speak it...');
            elements.modeDisplay.text('Mode: Rewrite');
        }
    }

    /**
     * Select a template
     */
    function selectTemplate(templateName) {
        // Remove selection from all templates
        $('.template-card').removeClass('selected');
        
        // Select current template
        $(`.template-card[data-template="${templateName}"]`).addClass('selected');
        
        // Set template text
        currentEmail.template = templateName;
        
        const templates = {
            meeting: "I would like to schedule a meeting to discuss [topic]. Are you available on [date] at [time]?",
            followup: "I wanted to follow up on [topic/previous conversation]. Could you please provide an update on [specific item]?",
            thankyou: "Thank you for [specific action/help]. I really appreciate your [time/support/assistance].",
            introduction: "My name is [your name] and I'm reaching out regarding [purpose]. I would like to [specific request or goal]."
        };
        
        if (templates[templateName]) {
            elements.emailInput.val(templates[templateName]);
            updateCharCount();
            validateInput();
        }
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
        $('.template-card').removeClass('selected');
        currentEmail.template = null;
        updateCharCount();
        validateInput();
        hideResult();
        stopVoiceInput();
        showToast('Cleared', 'Form has been cleared', 'info');
    }

    /**
     * Handle generate/rewrite button click
     * Uses async/await for API call
     */
    async function handleGenerate() {
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
            const result = await generateEmail(text, tone, currentMode);
            
            // Hide loading and show result
            hideLoading();
            displayResult(result);
            
            const successMsg = currentMode === 'write' ? 'Email generated successfully' : 'Email rewritten successfully';
            showToast('Success!', successMsg, 'success');
        } catch (error) {
            hideLoading();
            showToast('Error', error.message || 'Failed to process email', 'error');
            console.error('Generation error:', error);
        }
    }

    /**
     * Handle edit button click
     */
    function handleEdit() {
        const text = elements.generatedOutput.text();
        elements.emailInput.val(text);
        updateCharCount();
        validateInput();
        hideResult();
        
        // Scroll to input
        $('html, body').animate({
            scrollTop: elements.emailInput.offset().top - 100
        }, 500);
        
        showToast('Edit Mode', 'You can now edit and regenerate', 'info');
    }

    /**
     * Generate/Rewrite email using API
     * Returns a Promise (async function)
     * @param {string} text - Original email text or description
     * @param {string} tone - Desired tone
     * @param {string} mode - 'write' or 'rewrite'
     * @returns {Promise<Object>}
     */
    async function generateEmail(text, tone, mode) {
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
                        mode: mode,
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
                    currentEmail.generated = data.rewritten_text;
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
        elements.generateButton.prop('disabled', true);
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
        elements.generateButton.prop('disabled', false);
    }

    /**
     * Display result with jQuery animation
     * @param {Object} result - API response data
     */
    function displayResult(result) {
        // Update content
        elements.generatedOutput.text(result.rewritten_text);
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
        const text = elements.generatedOutput.text();
        
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
                handleGenerate();
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
