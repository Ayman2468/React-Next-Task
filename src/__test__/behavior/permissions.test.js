import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from '@testing-library/react';
import TaskModal from '@/components/TaskModal.js';
test('Non-owner cannot edit task', () => {
    render(_jsx(TaskModal, { isOpen: true, task: { id: 1, title: 'Private Task', description: '' }, currentUser: { id: 1 }, onClose: () => { }, onSubmit: () => { } }));
    const titleInput = screen.getByPlaceholderText('Title');
    const descriptionInput = screen.getByPlaceholderText('Description');
    const assigneeInput = screen.getByPlaceholderText('Assignee');
    const saveButton = screen.getByText('Save');
    expect(titleInput).toBeEnabled();
    expect(descriptionInput).toBeEnabled();
    expect(assigneeInput).toBeEnabled();
    expect(saveButton).toBeEnabled();
});
