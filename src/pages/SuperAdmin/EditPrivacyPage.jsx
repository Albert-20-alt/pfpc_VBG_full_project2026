import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Editor, EditorProvider, Toolbar, BtnBold, BtnItalic, BtnUnderline, BtnStrikeThrough, BtnBulletList, BtnNumberedList, BtnLink, BtnClearFormatting, Separator } from 'react-simple-wysiwyg';
import { api } from '@/api';
import { Shield, Save, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const EditPrivacyPage = () => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            setLoading(true);
            const data = await api.getContent('privacy_policy');
            if (data && data.content) {
                setContent(data.content);
            }
        } catch (err) {
            console.error("Failed to fetch privacy policy", err);
            toast({
                title: "Erreur",
                description: "Impossible de charger le contenu.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await api.updateContent('privacy_policy', content);
            toast({
                title: "Succès",
                description: "Politique de confidentialité mise à jour.",
                className: "bg-green-600 text-white border-none"
            });
        } catch (err) {
            console.error("Failed to save", err);
            toast({
                title: "Erreur",
                description: err.message || "Impossible de sauvegarder les modifications.",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Shield className="text-purple-400" />
                            Éditer la Politique de Confidentialité
                        </h1>
                        <p className="text-slate-400 mt-1">
                            Modifiez le contenu visible sur la page publique de confidentialité.
                        </p>
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="bg-purple-600 hover:bg-purple-700 text-white min-w-[150px]"
                    >
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {saving ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                </div>

                <div className="bg-slate-900 rounded-2xl border border-white/10 p-6 shadow-xl">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <style>{`
                                .rsw-editor {
                                    background: rgba(2, 6, 23, 0.5);
                                    border: 1px solid rgba(255, 255, 255, 0.1);
                                    border-radius: 0.5rem;
                                    color: white;
                                    min-height: 500px;
                                }
                                .rsw-toolbar {
                                    background: rgba(15, 23, 42, 0.5);
                                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                                }
                                .rsw-btn {
                                    color: #94a3b8;
                                }
                                .rsw-btn:hover {
                                    color: white;
                                    background: rgba(255, 255, 255, 0.1);
                                }
                                .rsw-btn[data-active="true"] {
                                    color: #a855f7; /* purple-500 */
                                    background: rgba(168, 85, 247, 0.1);
                                }
                                .rsw-separator {
                                    background: rgba(255, 255, 255, 0.1);
                                }
                            `}</style>
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-blue-200 text-sm mb-4">
                                <strong>Note :</strong> Utilisez l'éditeur ci-dessous pour formater votre texte facilement.
                            </div>

                            <EditorProvider>
                                <Editor value={content} onChange={(e) => setContent(e.target.value)}>
                                    <Toolbar>
                                        <BtnBold />
                                        <BtnItalic />
                                        <BtnUnderline />
                                        <BtnStrikeThrough />
                                        <Separator />
                                        <BtnNumberedList />
                                        <BtnBulletList />
                                        <Separator />
                                        <BtnLink />
                                        <BtnClearFormatting />
                                    </Toolbar>
                                </Editor>
                            </EditorProvider>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default EditPrivacyPage;
