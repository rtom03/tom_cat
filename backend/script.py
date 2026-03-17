import csv

with open('Jobs.csv', 'r', encoding='utf-8') as infile, \
        open('Jobs_clean.csv', 'w', encoding='utf-8', newline='') as outfile:

    reader = csv.reader(infile)
    writer = csv.writer(outfile)

    for row in reader:
        # Replace newlines inside any field with a space
        cleaned = [field.replace('\n', ' ').replace('\r', '') for field in row]
        writer.writerow(cleaned)

print("Done — Jobs_clean.csv is ready")
