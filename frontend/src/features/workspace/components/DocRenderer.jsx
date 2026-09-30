import React from 'react';
import ProseDocumentView from './ProseDocumentView';
import UserStoryView from './UserStoryView';
import ApiDocumentView from './ApiDocumentView';
import DatabaseView from './DatabaseView';

/**
 * DocRenderer
 *
 * Routes a normalized document object to the specialized viewer component
 * based on its docType.
 */
export const DocRenderer = ({
  docType,
  document,
  isEditing,
  onFieldChange,
  onStoriesChange,
  onEndpointsChange,
  onEntitiesChange,
  regenSectionId,
  onRegenSection
}) => {
  switch (docType) {
    case 'BRD':
    case 'SRS':
      return (
        <ProseDocumentView
          document={document}
          isEditing={isEditing}
          onFieldChange={onFieldChange}
          regenSectionId={regenSectionId}
          onRegenSection={onRegenSection}
        />
      );
    case 'UserStories':
      return (
        <UserStoryView
          document={document}
          isEditing={isEditing}
          onStoriesChange={onStoriesChange}
          regenStoryId={regenSectionId}
          onRegenStory={onRegenSection}
        />
      );
    case 'APISpec':
      return (
        <ApiDocumentView
          document={document}
          isEditing={isEditing}
          onEndpointsChange={onEndpointsChange}
        />
      );
    case 'DBSchema':
      return (
        <DatabaseView
          document={document}
          isEditing={isEditing}
          onEntitiesChange={onEntitiesChange}
        />
      );
    default:
      return (
        <p className="px-6 py-10 text-sm text-slate-500">
          Unknown document type: {docType}
        </p>
      );
  }
};

export default DocRenderer;
