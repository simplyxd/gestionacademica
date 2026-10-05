import { Stack, Text, TextInput, type TextInputProps } from '@mantine/core';

interface ParametroFieldProps extends TextInputProps {
  label: string;
  hint?: string;
}

/** Campo de formulario reutilizable para parámetros institucionales. */
export function ParametroField({ label, hint, ...inputProps }: ParametroFieldProps) {
  return (
    <Stack gap={4}>
      <TextInput label={label} {...inputProps} />
      {hint && (
        <Text size="xs" c="dimmed">
          {hint}
        </Text>
      )}
    </Stack>
  );
}
