export interface TableColumn<T> {
  label: string;
  property: keyof T | string;
  type: 'text' | 'image' | 'badge' | 'ship-badge' | 'progress' | 'checkbox' | 'button' | 'tag' | 'actions';
  visible?: boolean;
  cssClasses?: string[];
}
