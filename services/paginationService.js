/**
 * Pagination Service for Telegram
 * Handles splitting large lists into manageable pages
 * Production-ready for handling 80+ lectures safely
 */

const { Markup } = require('telegraf');

class PaginationService {
  /**
   * Paginate an array into chunks
   * @param {Array} items - Items to paginate
   * @param {Number} itemsPerPage - Items per page (default 8)
   * @returns {Array<Array>} Paginated items
   */
  static paginateArray(items, itemsPerPage = 8) {
    const pages = [];
    for (let i = 0; i < items.length; i += itemsPerPage) {
      pages.push(items.slice(i, i + itemsPerPage));
    }
    return pages;
  }

  /**
   * Create pagination keyboard with navigation
   * @param {Array} items - Items to display on current page
   * @param {Number} currentPage - Current page (0-indexed)
   * @param {Number} totalPages - Total pages
   * @param {String} prefix - Callback prefix (e.g., 'download_material')
   * @param {Array} extraButtons - Additional buttons to append
   * @returns {Object} Telegraf Markup inline keyboard
   */
  static createPaginationKeyboard(
    items,
    currentPage,
    totalPages,
    prefix,
    extraButtons = []
  ) {
    // Create item buttons
    const itemButtons = items.map(item => [
      Markup.button.callback(
        `${item.emoji || '📄'} ${item.label}`,
        `${prefix}_${item.id}`
      )
    ]);

    // Create navigation buttons
    const navButtons = [];
    
    if (totalPages > 1) {
      const row = [];
      
      // Previous button
      if (currentPage > 0) {
        row.push(
          Markup.button.callback(
            '⬅️ Previous',
            `pagination_${prefix}_${currentPage - 1}`
          )
        );
      }
      
      // Page counter (non-clickable)
      row.push(
        Markup.button.callback(
          `${currentPage + 1}/${totalPages}`,
          'pagination_noop'
        )
      );
      
      // Next button
      if (currentPage < totalPages - 1) {
        row.push(
          Markup.button.callback(
            'Next ➡️',
            `pagination_${prefix}_${currentPage + 1}`
          )
        );
      }
      
      navButtons.push(row);
    }

    // Combine all buttons
    const allButtons = [
      ...itemButtons,
      ...navButtons,
      ...extraButtons
    ];

    return Markup.inlineKeyboard(allButtons);
  }

  /**
   * Calculate safe text length for message
   * Returns true if message would exceed 4096 chars
   */
  static isMessageTooLong(text, buttonCount) {
    const textLength = text.length;
    const estimatedButtonSize = buttonCount * 50; // Rough estimate per button
    const totalEstimate = textLength + estimatedButtonSize;
    
    return totalEstimate > 3500; // Leave 500 char buffer for safety
  }
}

module.exports = PaginationService;
