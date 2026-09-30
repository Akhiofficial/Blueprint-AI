import { useState, useEffect, useCallback } from 'react';

/**
 * useWorkspaceResizer
 *
 * Custom hook to manage draggable horizontal resizing for the Blueprint Workspace:
 * - Left panel (Sidebar): 180px - 400px
 * - Right panel (Chat/History): 280px - 600px
 */
export const useWorkspaceResizer = ({
  initialSidebarWidth = 220,
  initialRightPanelWidth = 320,
} = {}) => {
  const [sidebarWidth, setSidebarWidth] = useState(initialSidebarWidth);
  const [rightPanelWidth, setRightPanelWidth] = useState(initialRightPanelWidth);
  const [isDraggingSidebar, setIsDraggingSidebar] = useState(false);
  const [isDraggingRightPanel, setIsDraggingRightPanel] = useState(false);

  const handleMouseMove = useCallback((e) => {
    if (isDraggingSidebar) {
      const newWidth = Math.max(180, Math.min(e.clientX, 400));
      setSidebarWidth(newWidth);
    } else if (isDraggingRightPanel) {
      const newWidth = Math.max(280, Math.min(window.innerWidth - e.clientX, 600));
      setRightPanelWidth(newWidth);
    }
  }, [isDraggingSidebar, isDraggingRightPanel]);

  const handleMouseUp = useCallback(() => {
    setIsDraggingSidebar(false);
    setIsDraggingRightPanel(false);
  }, []);

  useEffect(() => {
    if (isDraggingSidebar || isDraggingRightPanel) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDraggingSidebar, isDraggingRightPanel, handleMouseMove, handleMouseUp]);

  return {
    sidebarWidth,
    rightPanelWidth,
    isDraggingSidebar,
    isDraggingRightPanel,
    setIsDraggingSidebar,
    setIsDraggingRightPanel,
  };
};

export default useWorkspaceResizer;
