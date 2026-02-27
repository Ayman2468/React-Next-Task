import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from '@testing-library/react';
import TaskModal from '@/components/TaskModal';
test('TaskModal displays task title', () => {
    render(_jsx(TaskModal, { isOpen: true, onSubmit: () => { }, task: {
            id: 1,
            title: 'Fix Bug',
            description: '',
            ownerId: 1,
        }, currentUser: { id: 1 }, onClose: () => { } }));
    const titleInput = screen.getByPlaceholderText('Title');
    expect(titleInput).toHaveValue('Fix Bug');
});
