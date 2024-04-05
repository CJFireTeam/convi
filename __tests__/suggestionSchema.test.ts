import { suggestionSchema } from "../src/validations/suggestionSchema";
import {expect, jest, test} from '@jest/globals';

test('sugestion esquema ok', () => {
    suggestionSchema.parse({TextoSugerencia:'prueba hola como estan' });
     expect(suggestionSchema.parse({TextoSugerencia:'prueba hola como estan' })).toBe('prueba hola como estan'); 
});

/* test('sugestion esquema ok', () => {
    suggestionSchema.parse({TextoSugerencia:'' });
});
 */

