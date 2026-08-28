import * as React from 'react';
import { cn } from '@/lib/utils';

interface TabsContextValue {
    value: string;
    onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
}

export function Tabs({
    value: controlledValue,
    defaultValue,
    onValueChange,
    className,
    children,
    ...props
}: TabsProps) {
    const [uncontrolledValue, setUncontrolledValue] = React.useState<string>(defaultValue || '');
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : uncontrolledValue;

    const handleValueChange = React.useCallback(
        (newValue: string) => {
            if (!isControlled) {
                setUncontrolledValue(newValue);
            }
            onValueChange?.(newValue);
        },
        [isControlled, onValueChange]
    );

    return (
        <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
            <div className={cn('w-full', className)} {...props}>
                {children}
            </div>
        </TabsContext.Provider>
    );
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                'inline-flex h-10 items-center justify-center rounded-xl bg-muted/60 p-1 text-muted-foreground border border-border/50',
                className
            )}
            {...props}
        />
    );
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string;
}

export function TabsTrigger({ className, value, children, ...props }: TabsTriggerProps) {
    const context = React.useContext(TabsContext);
    if (!context) throw new Error('TabsTrigger must be used within Tabs');

    const isSelected = context.value === value;

    return (
        <button
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => context.onValueChange(value)}
            className={cn(
                'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                isSelected
                    ? 'bg-background text-foreground shadow-xs font-semibold'
                    : 'hover:bg-background/50 hover:text-foreground',
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string;
}

export function TabsContent({ className, value, children, ...props }: TabsContentProps) {
    const context = React.useContext(TabsContext);
    if (!context) throw new Error('TabsContent must be used within Tabs');

    if (context.value !== value) return null;

    return (
        <div
            role="tabpanel"
            className={cn(
                'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-in fade-in-50 duration-200',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
