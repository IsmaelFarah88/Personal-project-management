import { GoogleGenAI, Type } from "@google/genai";

/**
 * Suggests a list of development tasks for a project using the Gemini API.
 * @param projectName The name of the project.
 * @param projectDescription The description of the project.
 * @returns A promise that resolves to an array of task strings.
 */
export const suggestTasksForProject = async (projectName: string, projectDescription: string): Promise<string[]> => {
    try {
        if (!process.env.API_KEY) {
            console.error("API_KEY is not set.");
            throw new Error("API key is missing.");
        }
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const prompt = `Based on the project name "${projectName}" and the description "${projectDescription}", suggest a list of 5 to 7 primary development tasks. The tasks should be concise and actionable.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        tasks: {
                            type: Type.ARRAY,
                            description: "A list of suggested task strings.",
                            items: {
                                type: Type.STRING,
                                description: "A single, actionable task for the project."
                            }
                        }
                    },
                    required: ["tasks"]
                },
            },
        });

        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);

        if (result && Array.isArray(result.tasks)) {
            return result.tasks;
        }

        console.warn("Received an unexpected format from Gemini:", result);
        return [];

    } catch (error) {
        console.error("Error suggesting tasks with Gemini:", error);
        // In a production app, you might want to throw a custom error to be handled by the UI.
        // For this tool, returning an empty array and logging the error is sufficient.
        alert(`فشل في جلب الاقتراحات من الذكاء الاصطناعي. يرجى التأكد من أن مفتاح API الخاص بك صحيح. الخطأ: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return [];
    }
};
