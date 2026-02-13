import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  property: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  amount: number;
  category: 'maintenance' | 'utilities' | 'repairs' | 'property-tax' | 'insurance' | 'cleaning' | 'other';
  date: Date;
  dueDate?: Date;
  isPaid: boolean;
  paidDate?: Date;
  paymentMethod?: 'cash' | 'bank-transfer' | 'cheque' | 'online' | 'other';
  notes?: string;
  receipt?: string; // URL to receipt image
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    property: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      description: 'Name of the expense (e.g., Roof Repair, Water Bill)',
    },
    description: {
      type: String,
      trim: true,
      description: 'Detailed description of the expense',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
      description: 'Expense amount in ZMW',
    },
    category: {
      type: String,
      enum: ['maintenance', 'utilities', 'repairs', 'property-tax', 'insurance', 'cleaning', 'other'],
      default: 'maintenance',
      required: true,
      description: 'Category of expense for filtering and reporting',
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
      description: 'Date when expense was incurred',
    },
    dueDate: {
      type: Date,
      description: 'When payment is due (if applicable)',
    },
    isPaid: {
      type: Boolean,
      default: false,
      description: 'Whether the expense has been paid',
    },
    paidDate: {
      type: Date,
      description: 'Date when the expense was paid',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'bank-transfer', 'cheque', 'online', 'other'],
      description: 'How the expense was paid',
    },
    notes: {
      type: String,
      description: 'Additional notes about the expense',
    },
    receipt: {
      type: String,
      description: 'URL to receipt/invoice image',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
expenseSchema.index({ property: 1, owner: 1 });
expenseSchema.index({ date: -1 });
expenseSchema.index({ isPaid: 1 });
expenseSchema.index({ category: 1 });

export const Expense = mongoose.model<IExpense>('Expense', expenseSchema);
