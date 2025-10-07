/**
 * SmartMail AI - History Page JavaScript
 * Manages history display, search, and actions
 */

(function($) {
    'use strict';

    // Initialize on document ready
    $(document).ready(function() {
        initializeEventListeners();
        initializeSearch();
    });

    /**
     * Initialize all event listeners
     */
    function initializeEventListeners() {
        // Copy button click
        $('.copy-btn').on('click', handleCopy);

        // Delete button click
        $('.delete-btn').on('click', handleDelete);

        // Compare button click
        $('.compare-btn').on('click', handleCompare);

        // Clear all button click
        $('#clearAllButton').on('click', handleClearAll);

        // Modal copy button
        $('#modalCopyBtn').on('click', handleModalCopy);
    }

    /**
     * Initialize search functionality
     */
    function initializeSearch() {
        const searchInput = $('#searchInput');
        
        searchInput.on('input', function() {
            const searchTerm = $(this).val().toLowerCase();
            filterHistory(searchTerm);
        });
    }

    /**
     * Filter history items based on search term
     * @param {string} searchTerm - Search query
     */
    function filterHistory(searchTerm) {
        let visibleCount = 0;
        
        $('.history-item').each(function() {
            const $item = $(this);
            const originalText = $item.find('.original-text').text().toLowerCase();
            const rewrittenText = $item.find('.rewritten-text').text().toLowerCase();
            const tone = $item.find('.badge').text().toLowerCase();
            
            const matches = originalText.includes(searchTerm) || 
                          rewrittenText.includes(searchTerm) || 
                          tone.includes(searchTerm);
            
            if (matches) {
                $item.fadeIn(300);
                visibleCount++;
            } else {
                $item.fadeOut(300);
            }
        });
        
        // Update record count
        $('#recordCount').text(visibleCount);
        
        // Show message if no results
        if (visibleCount === 0 && searchTerm) {
            showNoResultsMessage();
        } else {
            hideNoResultsMessage();
        }
    }

    /**
     * Show no results message
     */
    function showNoResultsMessage() {
        if ($('#noResultsMessage').length === 0) {
            const message = $('<div id="noResultsMessage" class="col-12 text-center py-5">' +
                '<i class="fas fa-search fa-3x text-muted mb-3 opacity-25"></i>' +
                '<h4 class="text-muted">No Results Found</h4>' +
                '<p class="text-muted">Try a different search term</p>' +
                '</div>');
            $('#historyContainer').append(message);
        }
    }

    /**
     * Hide no results message
     */
    function hideNoResultsMessage() {
        $('#noResultsMessage').remove();
    }

    /**
     * Handle copy button click
     * Uses callback pattern with Promise
     */
    function handleCopy(e) {
        e.preventDefault();
        const text = $(this).data('text');
        const $button = $(this);
        
        copyToClipboard(text).then(success => {
            if (success) {
                showToast('Copied!', 'Email copied to clipboard', 'success');
                
                // Visual feedback
                const originalHtml = $button.html();
                $button.html('<i class="fas fa-check me-1"></i>Copied!');
                $button.prop('disabled', true);
                
                setTimeout(() => {
                    $button.html(originalHtml);
                    $button.prop('disabled', false);
                }, 2000);
            } else {
                showToast('Error', 'Failed to copy to clipboard', 'error');
            }
        });
    }

    /**
     * Handle delete button click
     * Uses async/await with Promise
     */
    async function handleDelete(e) {
        e.preventDefault();
        const $button = $(this);
        const historyId = $button.data('id');
        const $item = $(`.history-item[data-id="${historyId}"]`);
        
        // Confirm deletion
        if (!confirm('Are you sure you want to delete this record?')) {
            return;
        }
        
        // Show loading state
        $button.prop('disabled', true);
        $button.html('<i class="fas fa-spinner fa-spin"></i>');
        
        try {
            const response = await fetch(`/api/history/delete/${historyId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete record');
            }
            
            // Remove item with animation
            $item.fadeOut(300, function() {
                $(this).remove();
                updateRecordCount();
                checkIfEmpty();
            });
            
            showToast('Deleted', 'Record deleted successfully', 'success');
        } catch (error) {
            console.error('Delete error:', error);
            showToast('Error', 'Failed to delete record', 'error');
            
            // Restore button
            $button.prop('disabled', false);
            $button.html('<i class="fas fa-trash"></i>');
        }
    }

    /**
     * Handle compare button click
     */
    function handleCompare(e) {
        e.preventDefault();
        const $button = $(this);
        const original = $button.data('original');
        const rewritten = $button.data('rewritten');
        const tone = $button.data('tone');
        
        // Update modal content
        $('#modalOriginal').text(original);
        $('#modalRewritten').text(rewritten);
        $('#modalTone').text(tone.charAt(0).toUpperCase() + tone.slice(1));
        
        // Store rewritten text for copy button
        $('#modalCopyBtn').data('text', rewritten);
    }

    /**
     * Handle modal copy button
     */
    function handleModalCopy(e) {
        e.preventDefault();
        const text = $(this).data('text');
        const $button = $(this);
        
        copyToClipboard(text).then(success => {
            if (success) {
                showToast('Copied!', 'Email copied to clipboard', 'success');
                
                // Visual feedback
                const originalHtml = $button.html();
                $button.html('<i class="fas fa-check me-2"></i>Copied!');
                
                setTimeout(() => {
                    $button.html(originalHtml);
                }, 2000);
            } else {
                showToast('Error', 'Failed to copy to clipboard', 'error');
            }
        });
    }

    /**
     * Handle clear all button click
     * Uses async/await
     */
    async function handleClearAll(e) {
        e.preventDefault();
        
        // Confirm deletion
        if (!confirm('Are you sure you want to delete ALL history records? This cannot be undone.')) {
            return;
        }
        
        const $button = $(this);
        
        // Show loading state
        $button.prop('disabled', true);
        $button.html('<i class="fas fa-spinner fa-spin me-2"></i>Clearing...');
        
        try {
            const response = await fetch('/api/history/clear', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to clear history');
            }
            
            // Remove all items with animation
            $('.history-item').fadeOut(300, function() {
                $(this).remove();
                showEmptyState();
            });
            
            showToast('Cleared', 'All history has been cleared', 'success');
        } catch (error) {
            console.error('Clear all error:', error);
            showToast('Error', 'Failed to clear history', 'error');
            
            // Restore button
            $button.prop('disabled', false);
            $button.html('<i class="fas fa-trash-alt me-2"></i>Clear All History');
        }
    }

    /**
     * Update record count
     */
    function updateRecordCount() {
        const count = $('.history-item:visible').length;
        $('#recordCount').text(count);
    }

    /**
     * Check if history is empty and show empty state
     */
    function checkIfEmpty() {
        if ($('.history-item').length === 0) {
            showEmptyState();
        }
    }

    /**
     * Show empty state
     */
    function showEmptyState() {
        const emptyState = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-inbox fa-5x text-muted mb-4 opacity-25"></i>
                <h3 class="text-muted mb-3">No History Yet</h3>
                <p class="lead text-muted mb-4">
                    Start rewriting emails to build your history
                </p>
                <a href="/rewrite" class="btn btn-primary btn-lg">
                    <i class="fas fa-magic me-2"></i>Rewrite Your First Email
                </a>
            </div>
        `;
        
        $('#historyContainer').html(emptyState);
        $('.alert-info').fadeOut(300);
        $('#clearAllButton').fadeOut(300);
    }

})(jQuery);
