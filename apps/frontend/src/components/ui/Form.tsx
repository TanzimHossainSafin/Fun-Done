import { Button } from "./Button";
import { useState, type FormEvent, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

export interface JokeData {
    name: string;
    category: string;
    setup: string;
    punchline: string;
    imageUrl?: string;
}

export interface FormProps {
    name: string;
    category: string;
    setup: string;
    punchline: string;
    onSubmit: (data: JokeData) => void;
    resetOnSubmit?: boolean;
};

export const Form = ({ name, category, setup, punchline, onSubmit, resetOnSubmit = true }: FormProps) => {
    const [_name, setName] = useState('');
    const [_category, setCategory] = useState('');
    const [_setup, setSetup] = useState('');
    const [_punchline, setPunchline] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit({
            name: _name,
            category: _category,
            setup: _setup,
            punchline: _punchline,
            imageUrl: imagePreview
        });
        if (resetOnSubmit) {
            setName('');
            setCategory('');
            setSetup('');
            setPunchline('');
            handleRemoveImage();
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Author Name */}
            <input
                type="text"
                placeholder={name}
                value={_name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            
            {/* Category Tag */}
            <input
                type="text"
                placeholder={category}
                value={_category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            {/* Main Caption/Setup */}
            <textarea
                placeholder={setup}
                value={_setup}
                onChange={(e) => setSetup(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
            />
            
            {/* Punchline */}
            <textarea
                placeholder={punchline}
                value={_punchline}
                onChange={(e) => setPunchline(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
            />

            {/* Image Preview */}
            {imagePreview && (
                <div className="relative rounded-lg overflow-hidden border border-slate-200">
                    <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-auto max-h-96 object-cover"
                    />
                    <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-1.5 bg-slate-900/80 text-white rounded-full hover:bg-slate-900 transition"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
            />

            {/* Action Buttons */}
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                    <ImageIcon size={18} />
                    Add Photo/Meme
                </button>
                <Button
                    text="Post"
                    size="md"
                    color="primary"
                    type="submit"
                    onClick={handleSubmit}
                />
            </div>
        </form>
    )
};