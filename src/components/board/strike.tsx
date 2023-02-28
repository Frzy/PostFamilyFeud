import CloseIcon from '@mui/icons-material/Close'

interface StrikeProps {
  active?: boolean
}
export default function Strike({ active }: StrikeProps) {
  const color = active ? '#d32f2f' : '#424242'
  return (
    <CloseIcon
      sx={{
        color,
        border: `4px solid ${color}`,
        borderRadius: 2,
        fontSize: {
          xs: 64,
          sm: 58,
          md: 96,
          lg: 128,
        },
      }}
    />
  )
}
