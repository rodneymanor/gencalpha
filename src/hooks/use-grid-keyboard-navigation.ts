"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface GridKeyboardNavigationOptions {
  items: any[];
  columns: number;
  onItemSelect?: (item: any, index: number) => void;
  onItemActivate?: (item: any, index: number) => void;
  disabled?: boolean;
  initialFocusIndex?: number;
}

/**
 * Hook for keyboard navigation in grid layouts following Soft UI accessibility principles.
 * Supports arrow key navigation, Enter key activation, and proper focus management.
 *
 * Features:
 * - Dynamic column detection (adapts to CSS grid changes)
 * - Keyboard-only selection (hover only shows focus, doesn't trigger selection)
 * - Scroll protection (prevents focus changes during scroll for cleaner UX)
 * - Visual focus indicators (mouse hover updates focus ring without triggering actions)
 * - ARIA accessibility support
 */
export function useGridKeyboardNavigation({
  items,
  columns,
  onItemSelect,
  onItemActivate,
  disabled = false,
  initialFocusIndex = -1,
}: GridKeyboardNavigationOptions) {
  const [focusedIndex, setFocusedIndex] = useState<number>(initialFocusIndex);
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const lastDetectedColumns = useRef<number>(columns);

  // Scroll detection to prevent accidental video selection during scroll
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Dynamically detect actual column count from computed styles
  const getActualColumnCount = useCallback((): number => {
    if (!gridRef.current) return columns;

    try {
      const computedStyle = window.getComputedStyle(gridRef.current);
      const gridTemplateColumns = computedStyle.gridTemplateColumns;

      // Count the number of column definitions (e.g., "1fr 1fr 1fr" = 3 columns)
      if (gridTemplateColumns && gridTemplateColumns !== "none") {
        const columnArray = gridTemplateColumns.split(" ").filter((col) => col.trim() !== "");
        const actualColumns = columnArray.length;

        // Cache the detected columns to avoid repeated logging
        if (actualColumns !== lastDetectedColumns.current) {
          lastDetectedColumns.current = actualColumns;
        }

        // Fallback to original columns if detection fails
        return actualColumns > 0 ? actualColumns : columns;
      }
    } catch (error) {
      console.warn("Failed to detect grid columns:", error);
    }

    return columns;
  }, [columns]);

  // Calculate grid dimensions using actual column count
  const getGridDimensions = useCallback(() => {
    const actualColumns = getActualColumnCount();
    const rows = Math.ceil(items.length / actualColumns);
    return { columns: actualColumns, rows };
  }, [items.length, getActualColumnCount]);

  // Focus management - Visual focus only (no selection)
  const setVisualFocus = useCallback(
    (index: number) => {
      if (index >= 0 && index < items.length && itemRefs.current[index]) {
        itemRefs.current[index]?.focus();
        setFocusedIndex(index);
        // NO onItemSelect call - this is just visual focus
      }
    },
    [items.length],
  );

  // Focus management - Keyboard navigation (with selection)
  const focusItemWithSelection = useCallback(
    (index: number) => {
      if (index >= 0 && index < items.length && itemRefs.current[index]) {
        itemRefs.current[index]?.focus();
        setFocusedIndex(index);
        // Only call onItemSelect for keyboard navigation
        onItemSelect?.(items[index], index);
      }
    },
    [items, onItemSelect],
  );

  // Navigate to specific index with bounds checking (keyboard only)
  const navigateToIndex = useCallback(
    (newIndex: number) => {
      if (disabled || items.length === 0) return;

      // Clamp to valid range
      const clampedIndex = Math.max(0, Math.min(newIndex, items.length - 1));
      // Use the selection version for keyboard navigation
      focusItemWithSelection(clampedIndex);
    },
    [disabled, items.length, focusItemWithSelection],
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (disabled || items.length === 0) return;

      // Only handle navigation if focus is within the grid
      if (!gridRef.current?.contains(document.activeElement)) return;

      // Get current grid dimensions
      const { columns: actualColumns } = getGridDimensions();

      let newIndex = focusedIndex;
      let handled = false;

      switch (event.key) {
        case "ArrowRight":
          // Move right, wrap to next row if at end
          newIndex = focusedIndex < items.length - 1 ? focusedIndex + 1 : focusedIndex;
          handled = true;
          break;

        case "ArrowLeft":
          // Move left, wrap to previous row if at start
          newIndex = focusedIndex > 0 ? focusedIndex - 1 : focusedIndex;
          handled = true;
          break;

        case "ArrowDown":
          // Move down one row using actual column count
          newIndex = Math.min(focusedIndex + actualColumns, items.length - 1);
          handled = true;
          break;

        case "ArrowUp":
          // Move up one row using actual column count
          newIndex = Math.max(focusedIndex - actualColumns, 0);
          handled = true;
          break;

        case "Home":
          // Move to first item
          newIndex = 0;
          handled = true;
          break;

        case "End":
          // Move to last item
          newIndex = items.length - 1;
          handled = true;
          break;

        case "Enter":
        case " ":
          // Activate current item
          if (focusedIndex >= 0 && focusedIndex < items.length) {
            event.preventDefault();
            onItemActivate?.(items[focusedIndex], focusedIndex);
            handled = true;
          }
          break;
      }

      if (handled) {
        event.preventDefault();
        setIsKeyboardMode(true);
        if (newIndex !== focusedIndex) {
          navigateToIndex(newIndex);
        }
      }
    },
    [disabled, items, focusedIndex, getGridDimensions, onItemActivate, navigateToIndex],
  );

  // Handle scroll events to prevent focus changes during scroll (for cleaner UX)
  const handleScroll = useCallback(() => {
    setIsScrolling(true);

    // Clear previous timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set timeout to detect when scrolling has stopped
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150); // 150ms after scroll stops
  }, []);

  // Handle mouse interactions
  const handleMouseEnter = useCallback(
    (index: number) => {
      if (disabled) return;

      // Prevent mouse hover events during scrolling
      if (isScrolling) {
        return;
      }

      // Only update visual focus indicator - NEVER trigger video selection on hover
      // We set keyboard mode to false to indicate this is mouse interaction
      setIsKeyboardMode(false);
      // Use setVisualFocus which doesn't trigger onItemSelect
      setVisualFocus(index);
    },
    [disabled, isScrolling, setVisualFocus],
  );

  const handleMouseClick = useCallback(
    (index: number) => {
      if (disabled) return;

      // Mouse click should only activate (open panel), not select (change video)
      setIsKeyboardMode(false);
      setVisualFocus(index); // Visual focus only
      onItemActivate?.(items[index], index); // Open panel
    },
    [disabled, items, onItemActivate, setVisualFocus],
  );

  // Set up keyboard event listeners
  useEffect(() => {
    if (disabled) return;

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, disabled]);

  // Set up scroll event listeners
  useEffect(() => {
    if (disabled) return;

    // Listen for scroll events on both window and grid container
    const handleWindowScroll = handleScroll;
    const handleGridScroll = handleScroll;

    window.addEventListener("scroll", handleWindowScroll, { passive: true });

    if (gridRef.current) {
      gridRef.current.addEventListener("scroll", handleGridScroll, { passive: true });
    }

    return () => {
      window.removeEventListener("scroll", handleWindowScroll);
      if (gridRef.current) {
        gridRef.current.removeEventListener("scroll", handleGridScroll);
      }

      // Clean up timeout on unmount
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll, disabled]);

  // Also detect wheel events (trackpad/mouse wheel) for more immediate detection
  useEffect(() => {
    if (disabled) return;

    const handleWheel = (event: WheelEvent) => {
      // Only trigger if scroll has some velocity (not just tiny movements)
      if (Math.abs(event.deltaY) > 1 || Math.abs(event.deltaX) > 1) {
        handleScroll();
      }
    };

    const handleTouchStart = () => {
      // Prevent video selection during touch scrolling
      handleScroll();
    };

    const handleTouchMove = () => {
      // Continue preventing selection during touch movement
      handleScroll();
    };

    document.addEventListener("wheel", handleWheel, { passive: true });
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      document.removeEventListener("wheel", handleWheel);
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
    };
  }, [handleScroll, disabled]);

  // Initialize focus on first render or when items change
  useEffect(() => {
    if (disabled || items.length === 0) {
      setFocusedIndex(-1);
      return;
    }

    // If no item is focused and we have items, focus the first one when keyboard mode is active
    if (focusedIndex === -1 && isKeyboardMode) {
      setFocusedIndex(0);
    }
  }, [items.length, disabled, focusedIndex, isKeyboardMode]);

  // Update item refs array length when items change
  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, items.length);
  }, [items.length]);

  // Public API for external focus control
  const focusFirstItem = useCallback(() => {
    if (!disabled && items.length > 0) {
      setIsKeyboardMode(true);
      navigateToIndex(0);
    }
  }, [disabled, items.length, navigateToIndex]);

  const focusItemByIndex = useCallback(
    (index: number) => {
      if (!disabled && index >= 0 && index < items.length) {
        setIsKeyboardMode(true);
        navigateToIndex(index);
      }
    },
    [disabled, items.length, navigateToIndex],
  );

  // Helper to create item props
  const getItemProps = useCallback(
    (index: number) => ({
      ref: (el: HTMLElement | null) => {
        itemRefs.current[index] = el;
      },
      tabIndex: focusedIndex === index ? 0 : -1,
      "data-keyboard-focused": isKeyboardMode && focusedIndex === index,
      onMouseEnter: () => handleMouseEnter(index),
      onClick: () => handleMouseClick(index),
      onFocus: () => {
        // Only update visual focus if not in keyboard mode
        // Keyboard mode handles its own focus through navigation
        if (!isKeyboardMode && focusedIndex !== index) {
          setVisualFocus(index);
        }
      },
    }),
    [focusedIndex, isKeyboardMode, handleMouseEnter, handleMouseClick, setVisualFocus],
  );

  // Calculate current grid dimensions for ARIA attributes
  const { columns: actualColumns, rows: actualRows } = getGridDimensions();

  return {
    gridRef,
    focusedIndex,
    isKeyboardMode,
    focusFirstItem,
    focusItem: focusItemByIndex,
    getItemProps,
    // Grid container props
    gridProps: {
      ref: gridRef,
      role: "grid",
      "aria-rowcount": actualRows,
      "aria-colcount": actualColumns,
    },
  };
}
