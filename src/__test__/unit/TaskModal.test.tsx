import { render, screen } from '@testing-library/react';
import TaskModal from '@/components/TaskModal.js';

test('TaskModal displays task title', () => {
  render(
    <TaskModal
      isOpen={true}
      onSubmit={() => {}}
      task={{
        id: 1,
        title: 'Fix Bug',
        description: '',
        ownerId: 1,
      }}
      currentUser={{ id: 1 }} // owner
      onClose={() => {}}
    />
  );

  const titleInput = screen.getByPlaceholderText('Title');
  expect(titleInput).toHaveValue('Fix Bug');
});